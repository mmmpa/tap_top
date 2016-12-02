package taptop

import (
	"bufio"
	"regexp"
	"strconv"
	"strings"
)

type Tasks struct {
	Total    int
	Running  int
	Sleeping int
	Stopped  int
	Zombie   int
}

type CPU struct {
	User              float32
	System            float32
	Nice              float32
	Idle              float32
	IOWait            float32
	HardwareInterrupt float32
	SoftwareInterrupt float32
	StolenTime        float32
}

type Memory struct {
	Total   int
	Used    int
	Free    int
	Buffers int
}

type Swaps struct {
	Total     int
	Used      int
	Free      int
	CachedMem int
}

type Row struct {
	PID            int
	User           string
	Priority       string
	Nice           int
	VirtualMemory  int
	ResidentMemory int
	SharedMemory   int
	Status         string
	PerCPU         float32
	PerMemory      float32
	Time           float32
	Command        string
}

type Result struct {
	Tasks
	CPU
	Memory
	Swaps
	Rows []Row
}

func Run() {

}

var pickNumber = regexp.MustCompile(`[0-9\.]+`)
var pickValues = regexp.MustCompile(`[^ ]+`)

func toI(s string) int {
	n, err := strconv.Atoi(s)

	if err != nil {
		return 0
	}

	return n
}

func toF(s string) float32 {
	n, err := strconv.ParseFloat(s, 32)

	if err != nil {
		return 0
	}

	return float32(n)
}

func pickToI(text string) []int {
	picked := pickNumber.FindAllStringSubmatch(text, -1)
	l := len(picked)
	is := make([]int, l, l)
	for i, s := range picked {
		is[i] = toI(s[0])
	}
	return is
}

func pickToF(text string) []float32 {
	picked := pickNumber.FindAllStringSubmatch(text, -1)
	l := len(picked)
	is := make([]float32, l, l)
	for i, s := range picked {
		is[i] = toF(s[0])
	}
	return is
}

func Scan(scanner *bufio.Scanner) Result {
	result := Result{}

	// header
	scanner.Scan()

	// Tasks
	scanner.Scan()
	t := pickToI(scanner.Text())
	result.Tasks = Tasks{
		Total: t[0],
		Running: t[1],
		Sleeping: t[2],
		Stopped: t[3],
		Zombie: t[4],
	}

	// CPU
	scanner.Scan()
	c := pickToF(scanner.Text())
	result.CPU = CPU{
		User: c[0],
		System: c[1],
		Nice: c[2],
		Idle: c[3],
		IOWait: c[4],
		HardwareInterrupt: c[5],
		SoftwareInterrupt: c[6],
		StolenTime: c[7],
	}

	// Memory
	scanner.Scan()
	m := pickToI(scanner.Text())
	result.Memory = Memory{
		Total: m[0],
		Used: m[1],
		Free: m[2],
		Buffers: m[3],
	}

	type Swap struct {
		Total     int
		Used      int
		Free      int
		CachedMem int
	}

	// Swap
	scanner.Scan()
	s := pickToI(scanner.Text())
	result.Swaps = Swaps{
		Total: s[0],
		Used: s[1],
		Free: s[2],
		CachedMem: s[3],
	}

	// Blank
	scanner.Scan()

	// Processes Header
	scanner.Scan()

	// Processes
	for scanner.Scan() {
		result.Rows = append(result.Rows, pickToRow(scanner.Text()))
	}

	return result
}

func pickToRow(raw string) Row {
	cols := pickValues.FindAllStringSubmatch(raw, -1)
	// cols := strings.Split(strings.Replace(raw, "  ", " ", -1), " ")

	t := strings.Split(cols[10][0], ":")
	time := toF(t[0]) * 60 + toF(t[1])

	return Row{
		PID: toI(cols[0][0]),
		User: cols[1][0],
		Priority: cols[2][0],
		Nice: toI(cols[3][0]),
		VirtualMemory: toI(cols[4][0]),
		ResidentMemory: toI(cols[5][0]),
		SharedMemory: toI(cols[6][0]),
		Status: cols[7][0],
		PerCPU: toF(cols[8][0]),
		PerMemory: toF(cols[9][0]),
		Time: time,
		Command: cols[11][0],
	}
}