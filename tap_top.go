package taptop

import (
	"time"
	"sync"
)

func Run() {
	m := new(sync.Mutex)

	q := make(chan ResultRaw)
	c := NewCorrector(30)

	// TODO(mmmpa): to support to change log size after storing
	Retrieve("result.log", &c.Correction)

	go Connector{
		Q: q,
	}.Run()

	go Server{
		Port: 8090,
		Corrector: c,
	}.Run()

	go StoreInterval(10 * time.Second, "result.log", func() []byte {
		m.Lock()
		j, err := c.Marshal()
		m.Unlock()

		if err != nil {
			return nil
		}

		return j
	})

	for {
		m.Lock()
		c.Correct(<-q)
		m.Unlock()
	}
}

