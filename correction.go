package taptop

import "encoding/json"

type Corrector struct {
	Size       int
	Correction []Result
	Pos        int
}

func NewCorrector(size int) *Corrector {
	c := &Corrector{Size: size}
	c.Correction = make([]Result, size, size)
	return c
}

func (c *Corrector) Correct(raw ResultRaw) {
	c.Correction[c.Pos % c.Size] = Scan(raw)
	c.Pos += 1
}

func (c *Corrector) GetLatest() Result {
	if c.Correction == nil || c.Pos == 0 {
		return Result{}
	}

	p := c.Pos - 1

	if p < c.Size {
		return c.Correction[p]
	}

	return c.Correction[p % c.Size]
}

func (c *Corrector) Read() []Result {
	if c.Pos < c.Size {
		return c.Correction
	}

	correction := make([]Result, c.Size, c.Size)

	for i := 0; i < c.Size; i++ {
		correction[i] = c.Correction[(i + c.Pos) % c.Size]
	}

	return correction
}

func (c *Corrector) Marshal() ([]byte, error) {
	return json.Marshal(c.Correction)
}
