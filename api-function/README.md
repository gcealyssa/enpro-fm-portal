# EnPro Azure Function API

Replaces Render backend - NO MORE SLEEPING!

## Quick Setup

### 1. Create Function App in Azure
1. Portal → Create Resource → Function App
2. Name: `enpro-api-function`
3. Runtime: Node.js 18
4. Region: East US 2
5. Plan: Consumption (cheap) or Premium (always on)

### 2. Get Publish Profile
1. Go to Function App → Overview
2. Click "Get publish profile"
3. Download the file

### 3. Add GitHub Secret
1. GitHub repo → Settings → Secrets → Actions
2. New secret: `AZURE_FUNCTIONAPP_PUBLISH_PROFILE`
3. Paste the entire publish profile XML

### 4. Configure App Settings
In Azure Portal → Function App → Configuration:

```
AZURE_OPENAI_KEY = your-key
AZURE_OPENAI_ENDPOINT = https://pwgcerp-9302-resource.openai.azure.com
AZURE_OPENAI_DEPLOYMENT = gpt-4o
ASSISTANT_ID = asst_SyysrLVuOjyUfzXFuO30PwDf
```

### 5. Deploy
Push to `v1-simplified-frontend` branch - auto deploys!

### 6. Update Frontend
In `static/index.html`, set:
```javascript
const API_URL = 'https://enpro-api-function.azurewebsites.net/api/chat';
```

## Test
```bash
curl -X POST https://enpro-api-function.azurewebsites.net/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"CLR510","lane":"lookup"}'
```
