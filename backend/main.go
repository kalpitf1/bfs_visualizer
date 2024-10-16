package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	"github.com/gorilla/handlers"
	"github.com/gorilla/mux"
)

type Point struct {
	X int `json:"x"`
	Y int `json:"y"`
}

type PathRequest struct {
	Start     Point   `json:"start"`
	End       Point   `json:"end"`
	Obstacles []Point `json:"obstacles"`
}

type PathResponse struct {
	Path []Point `json:"path"`
}

const gridSize = 20

func main() {
	r := mux.NewRouter()
	r.HandleFunc("/find-path", findPathHandler).Methods("POST", "OPTIONS")

	// Apply CORS headers to the router
	cors := handlers.CORS(
		handlers.AllowedOrigins([]string{"https://bfsvis.netlify.app"}), // Allow requests from your React app
		handlers.AllowedMethods([]string{"POST", "OPTIONS"}),
		handlers.AllowedHeaders([]string{"Content-Type"}),
	)

	log.Fatal(http.ListenAndServe(":8080", cors(r)))
}

func findPathHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "https://bfsvis.netlify.app")

	var req PathRequest
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	fmt.Println("req: ", req.Start, req.End, req.Obstacles)
	path := findPath(req.Start, req.End, req.Obstacles)
	fmt.Println("path: ", path)
	response := PathResponse{Path: path}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func findPath(start Point, end Point, obstacles []Point) []Point {
	queue := []Point{start}
	visited := make([][]bool, gridSize)
	for i := range visited {
		visited[i] = make([]bool, gridSize)
	}
	visited[start.X][start.Y] = true

	parent := make(map[Point]Point)

	directions := []Point{{-1, 0}, {1, 0}, {0, -1}, {0, 1}}

	for len(queue) > 0 {
		current := queue[0]
		queue = queue[1:]

		if current == end {
			return reconstructPath(parent, start, end)
		}

		for _, dir := range directions {
			next := Point{X: current.X + dir.X, Y: current.Y + dir.Y}
			if isValid(next, &obstacles) && !visited[next.X][next.Y] {
				queue = append(queue, next)
				visited[next.X][next.Y] = true
				parent[next] = current
			}
		}
	}

	return nil // No path found
}

func isValid(p Point, obstacles *[]Point) bool {
	isPAnObstacle := false
	for _, a := range *obstacles {
		if a == p {
			isPAnObstacle = true
			break
		}
	}
	return !isPAnObstacle && p.X >= 0 && p.X < gridSize && p.Y >= 0 && p.Y < gridSize
}

func reconstructPath(parent map[Point]Point, start Point, end Point) []Point {
	path := []Point{end}
	for current := end; current != start; current = parent[current] {
		path = append([]Point{parent[current]}, path...)
	}
	return path
}
