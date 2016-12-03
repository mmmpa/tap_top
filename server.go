package taptop

import (
	"os"
	"net/http"
	"fmt"
	"net"
	"html/template"
	"log"
	"encoding/json"
)

type Server struct {
	Port      int
	Template  *template.Template
	Corrector *Corrector
}

type PageContent struct {
	Names      string
	RealNames  string
	Size       int
	Wait       int
	Correction string
}

func (s Server) Run() {
	t, err := template.ParseFiles("templates/index.html")

	if err != nil {
		log.Fatal(err)
	}

	s.Template = t

	listener, err := net.Listen("tcp", ":" + fmt.Sprint(s.Port))

	if err != nil {
		log.Fatal(err)
		os.Exit(1)
	}

	http.HandleFunc("/built.js", s.returnJavaScriptFile)
	http.HandleFunc("/r", s.returnLastResult)
	http.HandleFunc("/", s.renderIndex)
	log.Println("server")
	err = http.Serve(listener, nil)

	if err != nil {
		log.Fatal(err)
	}
}

func (s Server) renderIndex(w http.ResponseWriter, r *http.Request) {
	j, _ := json.Marshal(s.Corrector.Read())
	n, _ := json.Marshal(rowNames)
	rn, _ := json.Marshal(rowRealNames)
	s.Template.Execute(w, PageContent{
		Names: string(n),
		RealNames: string(rn),
		Size: s.Corrector.Size,
		Wait: 1,
		Correction: string(j),
	})
}

func (s Server) returnLastResult(w http.ResponseWriter, r *http.Request) {
	j, _ := json.Marshal(s.Corrector.GetLatest())

	w.Header().Set("Content-Type", "application/json")
	w.Write(j)
}

func (s Server) returnJavaScriptFile(w http.ResponseWriter, r *http.Request) {
	http.ServeFile(w, r, "js/built.js")
}
