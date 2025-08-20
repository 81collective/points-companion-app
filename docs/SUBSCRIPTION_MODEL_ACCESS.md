# Subscription-Based AI Model Access System

## Overview

The Points Companion app now includes a subscription-based model access system that provides users with different AI models based on their subscription plan. After upgrading their plan, users automatically gain access to more advanced AI models in the assistant interface.

## Subscription Plans

### Free Plan
- **Models Available**: GPT-3.5 Turbo
- **Features**: Basic recommendations and card analysis
- **Cost**: Free

### Basic Plan ($9/month)
- **Models Available**: GPT-3.5 Turbo, GPT-4o Mini
- **Features**: Faster responses, priority support
- **Best For**: Regular users who want better performance

### Premium Plan ($19/month) 
- **Models Available**: GPT-3.5 Turbo, GPT-4o Mini, GPT-4o, o1 Mini
- **Features**: Advanced reasoning, complex strategy planning
- **Best For**: Power users who need sophisticated analysis

### Enterprise Plan ($49/month)
- **Models Available**: All models including o1 Preview
- **Features**: Cutting-edge AI, custom training, white-glove support
- **Best For**: Business users and advanced strategists

## How It Works

### For Users

1. **Current Plan Display**: The AI Assistant shows your current plan and active model in the header
2. **Upgrade Prompts**: Free users see upgrade suggestions with preview of available models
3. **Instant Access**: After upgrading, new models are immediately available
4. **Model Selection**: The system automatically uses the best model available to your plan

### For Developers

The system consists of several key components:

#### Database Schema
```sql
-- Added to profiles table
subscription_plan TEXT NOT NULL DEFAULT 'free' CHECK (subscription_plan IN ('free', 'basic', 'premium', 'enterprise'))
subscription_status TEXT NOT NULL DEFAULT 'active' CHECK (subscription_status IN ('active', 'expired', 'cancelled', 'paused'))
subscription_expires_at TIMESTAMP WITH TIME ZONE
```

#### Model Access Control (`src/lib/modelAccess.ts`)
- `getUserSubscriptionInfo(userId)`: Gets user's subscription status
- `getAvailableModels(userId)`: Returns models available to user
- `getBestAvailableModel(userId)`: Gets the most advanced model for user
- `isModelAvailable(userId, model)`: Checks if user can access specific model

#### API Endpoints
- `GET /api/assistant/models`: Returns available models for current user
- `POST /api/subscription/upgrade`: Upgrades user's subscription plan
- `POST /api/assistant/converse`: Now uses plan-based model selection

#### React Components
- `<ModelStatus />`: Shows current model and plan in UI
- `<UpgradePrompt />`: Displays upgrade options for free users
- `<UpgradeModal />`: Full-featured upgrade interface

## Model Tiers

| Model | Plan Required | Use Case |
|-------|---------------|----------|
| gpt-3.5-turbo | Free | Basic recommendations |
| gpt-4o-mini | Basic | Balanced performance |
| gpt-4o | Premium | Advanced analysis |
| o1-mini | Premium | Deep reasoning |
| o1-preview | Enterprise | Cutting-edge capabilities |

## Implementation Details

### Authentication Integration
The system extends the existing `AuthContext` to include subscription information and automatically refreshes when plans change.

### Automatic Model Selection
The conversation API (`/api/assistant/converse`) automatically selects the best available model for each user without requiring client-side changes.

### Graceful Fallbacks
- Unauthenticated users get free tier access
- If a user's subscription expires, they fall back to free tier
- API errors default to previous behavior (GPT-4o) to maintain functionality

## Testing the System

### Manual Testing Steps

1. **Free User Experience**:
   - Visit the AI Assistant without logging in
   - Verify GPT-3.5 Turbo is shown as current model
   - Confirm upgrade prompt appears

2. **Upgrade Flow**:
   - Click "Upgrade Plan" button
   - Select a premium plan in the modal
   - Verify upgrade completes and new models appear

3. **Premium User Experience**:
   - After upgrading, verify higher-tier model is shown
   - Test that conversations use the upgraded model
   - Confirm upgrade prompt no longer appears

### API Testing
```bash
# Get available models (requires authentication)
curl -X GET /api/assistant/models

# Upgrade subscription (requires authentication)
curl -X POST /api/subscription/upgrade \
  -H "Content-Type: application/json" \
  -d '{"plan": "premium"}'
```

## Security Considerations

- Subscription status is validated on every API call
- Model access is enforced server-side, not client-side
- Upgrade operations require authentication
- Database constraints prevent invalid plan values

## Future Enhancements

1. **Payment Integration**: Replace mock upgrade with actual payment processing
2. **Usage Limits**: Add per-plan request limits or quotas
3. **Custom Models**: Allow enterprise users to fine-tune models
4. **Analytics**: Track model usage by plan for optimization
5. **A/B Testing**: Test different model assignments for conversion optimization

## Migration Notes

- The database migration adds subscription columns with safe defaults
- Existing users are automatically assigned the 'free' plan
- The system is backward compatible with existing API usage
- No breaking changes to existing functionality