package taptop

import (
	"io/ioutil"
	"encoding/json"
	"os"
	"time"
)

func StoreInterval(interval time.Duration, path string, get func() interface{}) {
	for {
		time.Sleep(interval)
		Store(path, get())
	}
}

func Store(path string, data interface{}) error {
	j, err := json.Marshal(data)

	if err != nil {
		return err
	}

	return ioutil.WriteFile(path, j, os.ModePerm)
}

func Retrieve(path string, container interface{}) error {
	b, err := ioutil.ReadFile(path)

	if err != nil {
		return err
	}

	return json.Unmarshal(b, container)
}

