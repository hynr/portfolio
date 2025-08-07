# GitHub Pages Deployment Guide

## Step 1: Create GitHub Repository

1. Go to [GitHub](https://github.com) and click "New repository"
2. Name it `portfolio` (or your preferred name)
3. Make it **Public** (required for free GitHub Pages)
4. Don't initialize with README (we already have files)

## Step 2: Connect Local Repository

Open terminal in your portfolio folder and run:

```bash
git init
git add .
git commit -m "Initial portfolio commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/portfolio.git
git push -u origin main
```

Replace `YOUR_USERNAME` with your actual GitHub username.

## Step 3: Configure GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** tab
3. Scroll to **Pages** section
4. Under **Source**, select **GitHub Actions**
5. The workflow in `.github/workflows/deploy.yml` will automatically deploy your site

## Step 4: Access Your Live Site

After deployment completes (2-3 minutes):
- Your site will be live at: `https://YOUR_USERNAME.github.io/portfolio`

## Troubleshooting

- If build fails, check the Actions tab for error logs
- Make sure your repository is public
- Verify all file paths are correct

## Custom Domain (Optional)

1. Add a `CNAME` file to `/public` folder with your domain
2. Configure DNS with your domain provider
3. Enable custom domain in repository Settings > Pages