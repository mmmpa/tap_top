package taptop

import (
	"golang.org/x/crypto/ssh"
	"log"
	"bytes"
	"fmt"
	"time"
	"os/exec"
	"bufio"
)

type Connector struct {
	Host     string
	Port     int
	User     string
	Password string
	Q        chan ResultRaw
}

func (c Connector) Run() {
	if c.Host != "" {
		c.connectSSH()
		return
	}

	c.connectLocal()
}

func (c Connector) connectSSH() {
	clientConfig := &ssh.ClientConfig{
		User: c.User,
		Auth: []ssh.AuthMethod{
			ssh.Password(c.Password),
		},
	}

	conn, err := ssh.Dial("tcp", fmt.Sprintf("%v:%v", c.Host, c.Port), clientConfig)
	if err != nil {
		log.Fatal("unable to connect: ", err)
	}
	defer conn.Close()

	session, _ := conn.NewSession()
	if err != nil {
		log.Fatal("session error: ", err)
	}
	defer session.Close()

	var stdoutBuf bytes.Buffer
	session.Stdout = &stdoutBuf

	for {
		session.Run(`top -n 1 -b`)
		c.Q <- ResultRaw(stdoutBuf.String())
		time.Sleep(1 * time.Second)
	}
}

func (c Connector) connectLocal() {
	cmd := exec.Command("top", "-d", "2", "-b")
	stdout, _ := cmd.StdoutPipe()
	cmd.Start()

	scanner := bufio.NewScanner(stdout)

	store := ""
	for scanner.Scan() {
		t := scanner.Text()
		if len(t) != 0 && t[0:1] == "t" {
			if len(store) > 0 {
				c.Q <- ResultRaw(store)
				store = ""
			}
		}else{
			store += scanner.Text() + "\n"
		}
	}
}
