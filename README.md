# WalkGuide

Walking-route planner with Street View immersive guided walks.

## Tech stack

- **Next.js 16** — App Router
- **BetterAuth** — authentication
- **MapLibre + OpenFreeMap** — interactive map
- **GraphHopper** — route planning
- **Mapbox** — geocoding
- **Google Maps JS** — Street View immersive walks
- **MongoDB** — primary data store
- **Redis** — caching / sessions
- **Kustomize + ArgoCD** — GitOps deployment
- **Vitest + MSW** — testing

## Local development

1. `cp .env.example .env.local` and fill in keys
2. `bun install`
3. `bun run dev`
4. Open http://localhost:3000

## Required external accounts

- **MongoDB Atlas** — free M0 cluster, get connection string
- **Google Cloud** — enable Maps JavaScript API, Places API, Street View Static, Directions API. Create OAuth 2.0 client (web). Get API key + restrict to your domain
- **GraphHopper** — sign up for free tier, get API key
- **Mapbox** — sign up for free tier, get token

## Deploying

This app deploys via ArgoCD. You need:

1. **App repo** (this one) — code + Dockerfile + CI
2. **Manifests repo** — `walkguide-manifests` containing `k8s/` contents from this repo
3. **GitHub secrets**:
   - `NEXT_PUBLIC_GMAPS_KEY` — public Maps key (referer-locked at GCP)
   - `MANIFESTS_PAT` — PAT with write access to manifests repo
4. **Sealed Secrets controller** in cluster
5. **Encrypt your real secrets** with `kubeseal`:

   ```bash
   echo -n 'YOUR_VALUE' > value.txt
   kubectl create secret generic walkguide-secrets \
     --dry-run=client \
     --from-file=MONGODB_URI=value.txt \
     --from-literal=BETTERAUTH_SECRET=... \
     --from-literal=GOOGLE_OAUTH_CLIENT_ID=... \
     ... \
     -o yaml \
     | kubeseal --format yaml --controller-namespace=kube-system \
     > k8s/base/sealed-secrets.yaml
   ```

6. **Apply ArgoCD Application**:

   ```bash
   kubectl apply -f argocd/walkguide.yaml
   ```

ArgoCD will sync the manifests and roll out the app.

### Placeholders to replace when forking

When forking this repo, update these placeholder strings to match your own infra:

- `REPLACE_OWNER` in `k8s/base/kustomization.yaml`, `k8s/overlays/prod/kustomization.yaml`, and `argocd/walkguide.yaml`
- `walkguide.example.com` in `k8s/base/ingress.yaml` (and the dev hostname `walkguide.dev.example.com` in `k8s/overlays/dev/kustomization.yaml`)
