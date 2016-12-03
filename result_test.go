package taptop

import (
	"testing"
	"io/ioutil"
)

func TestScan(t *testing.T) {
	b, _ := ioutil.ReadFile("./testdata/top_result.log")
	r := Scan(ResultRaw(b))

	if r.Tasks.Running != 3 {
		t.Fail()
	}

	if r.CPU.System != 2.7 {
		t.Fail()
	}

	if r.Memory.Total != 32977104 {
		t.Fail()
	}

	if r.Swaps.Total != 20260860 {
		t.Fail()
	}

	if len(r.Rows) != 68 {
		t.Fail()
	}
}
