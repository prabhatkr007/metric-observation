# Observability Demo API

This project is a simple Express-based API that includes logging, metrics, and monitoring capabilities using Prometheus, Loki, and Winston.

## Features

- **Logging with Loki**: Uses Winston and Loki Transport for structured logging.
- **Metrics with Prometheus**: Monitors API requests, database query durations, and error counts.
- **Middleware for Observability**: Includes request logging and metrics collection.
- **Simulated Database Queries**: Fake database queries with random delays for testing.

## Prerequisites

Ensure you have the following installed:
- Node.js (v14 or higher)
- Docker (for running Loki and Prometheus)

## Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/your-repo/observability-demo.git
   cd observability-demo
   ```
2. Install dependencies:
   ```sh
   npm install
   ```

## Usage

### Start the Server
Run the following command to start the API:
```sh
node server.js
```

The server will start on `http://localhost:3000`.

### API Endpoints

```markdown
| Method | Endpoint      | Description                  |
|--------|--------------|------------------------------|
| GET    | `/api/data`  | Fetch sample data with logs |
| GET    | `/metrics`   | Expose Prometheus metrics   |
```

### Simulating API Behavior

- 20% of requests to `/api/data` will return an error.
- Random database query delays (either 100ms or 3000ms) to simulate performance variations.

### Running with Docker (Loki & Prometheus Setup)

To use Loki and Prometheus, you can set up a `docker-compose.yml` file:

```yaml
version: '3'
services:
  loki:
    image: grafana/loki:latest
    ports:
      - "3100:3100"
  promtail:
    image: grafana/promtail:latest
    volumes:
      - /var/log:/var/log
```

Then run:
```sh
docker-compose up -d
```

## Monitoring with Prometheus

1. Install Prometheus and configure it to scrape metrics from `http://localhost:3000/metrics`.
2. Run Prometheus and visit `http://localhost:9090` to view collected metrics.

## Logging with Loki

1. Run Loki using Docker (`docker-compose up -d`).
2. Access logs via Grafana by adding Loki as a data source.
