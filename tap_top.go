package taptop

import "time"

func Run() {
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

	go StoreInterval(10 * time.Second, "result.log", func() interface{} {
		return c.Correction
	})

	for {
		c.Correct(<-q)
	}
}

