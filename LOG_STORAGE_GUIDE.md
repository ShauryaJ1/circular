# Log Storage and Retrieval System

This system provides semantic search and storage capabilities for logs and issues using embeddings and full-text search.

## Features

- **Semantic Search**: Uses transformer-based embeddings for intelligent similarity search
- **Full-Text Search**: PostgreSQL full-text search for keyword matching
- **Tag-Based Search**: Organize and retrieve logs by tags
- **Hybrid Search**: Combines vector similarity and text search for best results
- **Metadata Support**: Store additional context with each log entry

## Setup

### 1. Install Dependencies

```bash
pnpm install
# or
npm install
```

### 2. Ensure Database is Set Up

Make sure your PostgreSQL database has the required extensions:

```bash
pnpm db:push
# or
npx prisma db push
```

## Usage

### Store a Log Entry

Use the `--store` flag to save logs with embeddings:

```bash
# Basic usage
./agent.sh --store --issue "API returns 500 error on login"

# With solution
./agent.sh --store --issue "Database connection timeout" --solve "Increased connection pool size from 10 to 50"

# With tags
./agent.sh --store --issue "Memory leak in production" --solve "Fixed circular reference in event listeners" --tags bug memory production

# With metadata (JSON format)
./agent.sh --store --issue "Performance degradation" --tags performance --metadata '{"severity":"high","component":"api","version":"2.1.0"}'
```

### Retrieve Logs

Use the `--retrieve` flag to search logs:

```bash
# Semantic search (finds similar issues even with different wording)
./agent.sh --retrieve --input "database connection errors"

# Search by tags
./agent.sh --retrieve --tags bug database

# Limit results
./agent.sh --retrieve --input "authentication problems" --limit 10

# Combined search (uses both input and tags)
./agent.sh --retrieve --input "login issues" --tags security auth
```

## How It Works

### Embeddings

The system uses the `dengcao/Qwen3-Embedding-4B:Q5_K_M` model via Ollama to generate 1536-dimensional embeddings. These embeddings capture the semantic meaning of text, allowing for intelligent similarity search.

**Architecture**: The system uses Ollama's REST API at `http://localhost:11434` for embedding generation. Ollama provides a simple, efficient way to run quantized models locally with GPU acceleration.

**Model**: We use the Q5_K_M quantized version of Qwen3-Embedding-4B, which provides excellent quality while being memory-efficient (~3-4GB).

### Storage Structure

Each log entry contains:
- `id`: Unique identifier (UUID)
- `issue_text`: The problem description
- `solution_text`: The solution (optional)
- `tags`: Array of categorization tags
- `timestamp`: When the log was created
- `metadata`: Additional JSON data
- `embedding`: Vector representation for semantic search
- `text_search`: Full-text search index

### Search Methods

1. **Vector Similarity**: Uses cosine similarity between query and stored embeddings
2. **Full-Text Search**: PostgreSQL's tsvector for keyword matching
3. **Tag Filtering**: Direct array matching on tags
4. **Hybrid Approach**: Combines multiple methods for comprehensive results

## Examples

### Storing Common Issues

```bash
# Development issues
./agent.sh --store --issue "Webpack build fails with out of memory error" \
  --solve "Increased NODE_OPTIONS --max-old-space-size to 4096" \
  --tags build webpack memory

# API issues
./agent.sh --store --issue "REST API endpoint /users returns 404" \
  --solve "Fixed route registration order in Express middleware" \
  --tags api routing bug

# Database issues
./agent.sh --store --issue "Slow query on users table with 1M+ records" \
  --solve "Added composite index on (created_at, status) columns" \
  --tags database performance optimization
```

### Effective Searching

```bash
# Find similar issues (semantic search is very flexible)
./agent.sh --retrieve --input "application runs out of memory during compilation"
# This will find the webpack memory issue even with different wording

# Find all performance-related issues
./agent.sh --retrieve --tags performance --limit 20

# Find database optimization solutions
./agent.sh --retrieve --input "slow database queries" --tags optimization
```

## Best Practices

1. **Descriptive Issues**: Write clear, detailed issue descriptions for better search results
2. **Consistent Tags**: Use a consistent tagging system (e.g., bug, feature, performance, security)
3. **Document Solutions**: Always include solutions when problems are resolved
4. **Use Metadata**: Store environment details, versions, or severity in metadata
5. **Regular Retrieval**: Search existing logs before debugging new issues

## Technical Details

### Embedding Model
- Model: `dengcao/Qwen3-Embedding-4B:Q5_K_M` (via Ollama)
- Dimensions: 1536
- Type: Quantized transformer embeddings
- Service: Ollama API on port 11434
- Performance: ~50-150ms per embedding (with GPU acceleration)

### Database
- PostgreSQL with pgvector extension
- Full-text search with tsvector
- Prisma ORM for database operations

### Performance
- Embeddings are generated locally (no API calls)
- Vector search uses efficient HNSW index
- Results combine multiple search strategies for accuracy

## Setup Requirements

### Install and Start Ollama

Before using the log storage system, you need Ollama running with the embedding model:

```bash
# Install Ollama (if not installed)
# Visit: https://ollama.ai

# Pull the embedding model (first time only)
ollama pull dengcao/Qwen3-Embedding-4B:Q5_K_M

# Start Ollama service (if not running)
ollama serve
```

The setup.sh script will automatically check for Ollama and offer to install the model.

## Troubleshooting

If you encounter issues:

1. **Ollama Not Running**: Start Ollama with `ollama serve`
2. **Model Not Installed**: Install with `ollama pull dengcao/Qwen3-Embedding-4B:Q5_K_M`
3. **Model Download**: First download takes ~3-4GB (quantized version)
4. **Database Connection**: Ensure DATABASE_URL is set in .env
5. **Missing Extensions**: Run `pnpm db:push` to create required PostgreSQL extensions
6. **GPU Acceleration**: Ollama automatically uses GPU if available (NVIDIA/AMD/Apple Silicon)

## Future Enhancements

Potential improvements for this system:
- Support for larger embedding models when available in ONNX
- Batch processing for multiple log entries
- Export/import functionality
- Web UI for browsing logs
- Automatic tagging based on content
- Integration with monitoring systems
