package taptop

import (
	"testing"
	"os"
	"strconv"
)

func TestConnect(t *testing.T) {
	q := make(chan ResultRaw)
	go Connector{
		Host: os.Getenv("TAP_TOP_TEST_HOST"),
		Port: func() int {
			i, _ := strconv.Atoi(os.Getenv("TAP_TOP_TEST_PORT"))
			return i
		}(),
		User: os.Getenv("TAP_TOP_TEST_USER"),
		Password: os.Getenv("TAP_TOP_TEST_PASSWORD"),
		Q: q,
	}.Run()

	for i := 0; i < 2; i++ {
		s := <-q
		if len(s) == 0 {
			t.Fail()
		}
	}
}

func TestLocalConnect(t *testing.T) {
	q := make(chan ResultRaw)
	go Connector{Q: q}.Run()

	for i := 0; i < 2; i++ {
		s := <-q
		if len(s) == 0 {
			t.Fail()
		}
	}
}
