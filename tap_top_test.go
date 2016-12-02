package taptop

import (
	"testing"
	"io/ioutil"
	"bufio"
	"bytes"
)

func TestScan(t *testing.T) {
	b, _ := ioutil.ReadFile("./testdata/top_result.log")
	scanner := bufio.NewScanner(bytes.NewReader(b))

	r := Scan(scanner)

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

	if len(r.Rows) != 343 {
		t.Fail()
	}
}
