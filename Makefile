.PHONY: dev dev-worker dev-app deploy test-local test-prod

# Local development — run these in separate terminals
dev-worker:
	cd worker && npm run dev -- --port 8787

dev-app:
	EXPO_PUBLIC_API_URL=http://localhost:8787 npx expo start

# Run both (requires ctrl-c to kill both)
dev:
	$(MAKE) dev-worker & $(MAKE) dev-app

# Deploy worker to Cloudflare
deploy:
	cd worker && npx wrangler deploy

# Test local worker
test-local:
	@echo "==> Health"
	@curl -s http://localhost:8787/api/health
	@echo "\n==> Vote (valid device ID)"
	@curl -s -X POST http://localhost:8787/api/vote \
		-H "Content-Type: application/json" \
		-H "X-Device-ID: 550e8400-e29b-41d4-a716-446655440000" \
		-d '{"city":"New York","vote":true}'
	@echo "\n==> Duplicate vote (should 409)"
	@curl -s -X POST http://localhost:8787/api/vote \
		-H "Content-Type: application/json" \
		-H "X-Device-ID: 550e8400-e29b-41d4-a716-446655440000" \
		-d '{"city":"New York","vote":true}'
	@echo "\n==> Results"
	@curl -s http://localhost:8787/api/results/New%20York \
		-H "X-Device-ID: 550e8400-e29b-41d4-a716-446655440000"
	@echo "\n==> Invalid device ID (should 401)"
	@curl -s -X POST http://localhost:8787/api/vote \
		-H "Content-Type: application/json" \
		-H "X-Device-ID: invalid" \
		-d '{"city":"New York","vote":true}'
	@echo ""

# Test production worker (set PROD_URL first)
PROD_URL ?= https://goingout-api.YOUR_SUBDOMAIN.workers.dev
test-prod:
	@echo "==> Health"
	@curl -s $(PROD_URL)/api/health
	@echo "\n==> Vote"
	@curl -s -X POST $(PROD_URL)/api/vote \
		-H "Content-Type: application/json" \
		-H "X-Device-ID: 550e8400-e29b-41d4-a716-446655440000" \
		-d '{"city":"New York","vote":true}'
	@echo ""

# TypeScript checks
typecheck:
	npx tsc --noEmit
	cd worker && npx tsc --noEmit
