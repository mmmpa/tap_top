package taptop

func Run() {
	q := make(chan ResultRaw)
	c := NewCorrector(100)

	go Connector{
		Q: q,
	}.Run()

	go Server{
		Port: 8090,
		Corrector: c,
	}.Run()

	for {
		c.Correct(<-q)
	}
}
