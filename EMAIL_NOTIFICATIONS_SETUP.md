# Email Notifications Setup Guide

This guide explains how to set up email notifications for your GitHub Actions workflows when tests fail.

## Setup Instructions

### 1. Repository Secrets Configuration

You need to add the following secrets to your GitHub repository:

1. Go to your repository on GitHub
2. Click on **Settings** > **Secrets and variables** > **Actions**
3. Add these repository secrets:

#### Required Secrets:

| Secret Name      | Description                            | Example                                    |
| ---------------- | -------------------------------------- | ------------------------------------------ |
| `EMAIL_USERNAME` | Your email address (sender)            | `your-email@gmail.com`                     |
| `EMAIL_PASSWORD` | App password for your email            | `your-app-password`                        |
| `EMAIL_TO`       | Email address to receive notifications | `dev-team@company.com`                     |
| `EMAIL_FROM`     | Display name for sender                | `GitHub Actions <noreply@yourcompany.com>` |

### 2. Gmail Setup (Recommended)

If using Gmail:

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate an App Password**:
   - Go to Google Account settings
   - Security > 2-Step Verification > App passwords
   - Generate a new app password for "GitHub Actions"
   - Use this app password as `EMAIL_PASSWORD` secret

### 3. Alternative Email Providers

#### Outlook/Hotmail:

```yaml
server_address: smtp-mail.outlook.com
server_port: 587
```

#### Yahoo:

```yaml
server_address: smtp.mail.yahoo.com
server_port: 587
```

#### Custom SMTP:

```yaml
server_address: your-smtp-server.com
server_port: 587
username: ${{ secrets.EMAIL_USERNAME }}
password: ${{ secrets.EMAIL_PASSWORD }}
```

## Workflow Features

### 1. Test Failure Notifications

- Triggers when any test in the test suite fails
- Includes detailed failure information
- Provides direct links to failed workflow runs
- Shows commit details and author information

### 2. Comprehensive Notifications

- Separate workflow that monitors all test workflows
- Sends both failure and success notifications
- Rich HTML formatting with colors and styling
- Contextual information for debugging

### 3. Smart Filtering

- Only sends success emails for main branch deployments
- Failure emails for all branches
- Avoids spam by consolidating notifications

## Customization Options

### 1. Email Recipients

To send to multiple recipients:

```yaml
to: "dev1@company.com,dev2@company.com,manager@company.com"
```

### 2. Subject Line Customization

```yaml
subject: "[URGENT] Tests Failed in ${{ github.repository }} - ${{ github.ref_name }}"
```

### 3. Conditional Notifications

Send emails only for specific branches:

```yaml
if: failure() && (github.ref == 'refs/heads/main' || github.ref == 'refs/heads/develop')
```

### 4. Slack Integration Alternative

Instead of email, you could use Slack:

```yaml
- name: Slack Notification
  uses: 8398a7/action-slack@v3
  with:
    status: failure
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

## Testing the Setup

1. **Test Email Configuration**:

   - Push a commit that intentionally breaks a test
   - Check if you receive the failure email
   - Verify all links and information are correct

2. **Test Success Notifications**:
   - Push a commit to main that passes all tests
   - Verify you receive the success notification

## Troubleshooting

### Common Issues:

1. **Authentication Failed**:

   - Verify app password is correct
   - Ensure 2FA is enabled for Gmail
   - Check email username format

2. **Emails Not Received**:

   - Check spam/junk folder
   - Verify email addresses in secrets
   - Test with a different email provider

3. **Workflow Not Triggering**:
   - Ensure workflow files are in `.github/workflows/`
   - Check workflow syntax with GitHub's validator
   - Verify repository secrets are set correctly

### Debug Mode:

Add this step to debug email issues:

```yaml
- name: Debug Email Settings
  run: |
    echo "Email configured for: ${{ secrets.EMAIL_TO }}"
    echo "Workflow status: ${{ job.status }}"
    echo "Trigger event: ${{ github.event_name }}"
```

## Security Best Practices

1. **Use App Passwords**: Never use your main email password
2. **Limit Recipients**: Only send to necessary team members
3. **Rotate Secrets**: Regularly update email passwords
4. **Environment Separation**: Use different email accounts for different environments

## Alternative Solutions

### 1. GitHub's Built-in Notifications

Enable in repository settings:

- Settings > Notifications
- Watch repository
- Choose email frequency

### 2. Third-party Services

- **SendGrid**: Professional email service
- **Mailgun**: Email API service
- **AWS SES**: Amazon's email service

### 3. Communication Platforms

- **Microsoft Teams**: Use webhook connectors
- **Discord**: Use Discord webhooks
- **Telegram**: Use Telegram bots

## Monitoring and Analytics

Track email delivery and workflow performance:

```yaml
- name: Log notification sent
  run: |
    echo "Email notification sent at $(date)"
    echo "Recipient: ${{ secrets.EMAIL_TO }}"
    echo "Workflow: ${{ github.workflow }}"
```

This setup provides comprehensive email notifications for your CI/CD pipeline, ensuring you're immediately aware of any test failures or important successes in your codebase.
