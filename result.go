package taptop

import (
	"bufio"
	"regexp"
	"strconv"
	"strings"
	"time"
)

type ResultRaw string

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

type Row interface{}

type Result struct {
	Tasks `json:"tasks"`
	CPU `json:"cpu"`
	Memory `json:"memory"`
	Swaps `json:"swaps"`
	Rows         [][]string `json:"processes"`
	RowPositions map[string]int `json:"rowPositions"`
	Time         int `json:"time"`
}

var (
	pickNumber = regexp.MustCompile(`[0-9\.]+`)
	pickValues = regexp.MustCompile(`[^ ]+`)
	rowNames = []string{
		"PID",
		"USER",
		"PR",
		"NI",
		"VIRT",
		"RES",
		"SHR",
		"S",
		"%CPU",
		"%MEM",
		"TIME+",
		"COMMAND",
	}
	rowRealNames = []string{
		"PID",
		"User",
		"Priority",
		"Nice",
		"VirtualMemory",
		"ResidentMemory",
		"SharedMemory",
		"Status",
		"PerCPU",
		"PerMemory",
		"Time",
		"Command",
	}
)

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

func Scan(raw ResultRaw) Result {
	scanner := bufio.NewScanner(strings.NewReader(string(raw)))
	result := Result{
		Time: int(time.Now().Unix()),
	}

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
	result.RowPositions = map[string]int{}
	picked := pickValues.FindAllStringSubmatch(scanner.Text(), -1)
	for i, n := range picked {
		result.RowPositions[n[0]] = i
	}

	// Processes
	for scanner.Scan() {
		result.Rows = pickToRow(scanner.Text(), result.Rows)
	}

	return result
}

func pickToRow(raw string, container [][]string) [][]string {
	cols := pickValues.FindAllStringSubmatch(raw, -1)

	// no work
	if cols[8][0] == "0.0" && cols[9][0] == "0.0" {
		return container
	}

	row := make([]string, 12, 12)
	for i, c := range cols {
		row[i] = c[0]
	}

	return append(container, row)
}