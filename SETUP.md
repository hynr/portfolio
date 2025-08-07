# Portfolio Setup Guide

This guide will help you set up and deploy your FAANG-level portfolio website.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

Visit `http://localhost:3000` to see your portfolio.

## 📝 Customization

### Personal Information
Update the following files with your information:

1. **Hero Section** (`components/HeroSection.tsx`):
   - Name and title
   - GitHub/LinkedIn URLs
   - Email address
   - Stats and metrics

2. **Experience Section** (`components/ExperienceSection.tsx`):
   - Work experience details
   - Company information
   - Achievements and metrics

3. **Projects Section** (`components/ProjectsSection.tsx`):
   - Project descriptions
   - GitHub repository links
   - Live demo URLs
   - Technologies used

4. **Skills Section** (`components/SkillsSection.tsx`):
   - Technical skills and proficiency levels
   - Years of experience
   - Skill descriptions

5. **Contact Section** (`components/ContactSection.tsx`):
   - Contact information
   - Social media links
   - Location

### SEO & Meta Tags
Update the following in `app/layout.tsx`:
- Title and description
- Open Graph tags
- Keywords

## 🌐 Deployment to GitHub Pages

### 1. Create GitHub Repository
1. Create a new repository named `portfolio` on GitHub
2. Make sure it's public for GitHub Pages

### 2. Push Your Code
```bash
git init
git add .
git commit -m "Initial portfolio setup"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/portfolio.git
git push -u origin main
```

### 3. Enable GitHub Pages
1. Go to repository Settings
2. Navigate to Pages section
3. Source: GitHub Actions
4. The workflow will automatically deploy your site

### 4. Update URLs
Update the following URLs in your code:
- `next.config.js`: Update `basePath` if needed
- `package.json`: Update `homepage` URL
- `CNAME` file: Add your custom domain (optional)

## 🔧 Configuration Files

### Environment Variables
Create a `.env.local` file for local development:
```env
# Contact form integration (optional)
NEXT_PUBLIC_EMAILJS_SERVICE_ID=your_service_id
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=your_template_id
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=your_public_key
```

### Custom Domain (Optional)
1. Create a `CNAME` file in the `public` folder
2. Add your domain name
3. Configure DNS settings with your domain provider

## 🎨 Customization Tips

### Colors
Modify colors in `tailwind.config.js`:
```js
colors: {
  primary: {
    50: '#f0f9ff',
    500: '#3b82f6',  // Main brand color
    600: '#2563eb',
    // ... other shades
  }
}
```

### Animations
Framer Motion animations can be customized in each component:
- `initial`: Starting state
- `animate`: End state
- `transition`: Animation properties

### Fonts
Update fonts in `app/globals.css`:
```css
@import url('https://fonts.googleapis.com/css2?family=YourFont:wght@100;200;300;400;500;600;700;800;900&display=swap');
```

## 📊 Performance Optimization

The portfolio is already optimized with:
- Next.js static export
- Optimized images
- Lazy loading animations
- Efficient re-renders
- Minimal bundle size

### Lighthouse Score Targets
- Performance: 90+
- Accessibility: 100
- Best Practices: 100
- SEO: 100

## 🐛 Troubleshooting

### Build Issues
1. Clear Next.js cache: `rm -rf .next`
2. Reinstall dependencies: `rm -rf node_modules && npm install`
3. Check Node.js version: Should be 18+ 

### Deployment Issues
1. Check GitHub Actions logs
2. Ensure `out` folder is generated
3. Verify `next.config.js` settings

### Contact Form
The contact form currently shows a demo. To make it functional:
1. Use a service like EmailJS, Formspree, or Netlify Forms
2. Update the form submission logic in `ContactSection.tsx`

## 🆘 Support

If you encounter any issues:
1. Check the console for errors
2. Review the GitHub Actions logs
3. Ensure all URLs are correctly configured
4. Verify file paths and imports

## 🎯 Final Checklist

Before deploying:
- [ ] All personal information updated
- [ ] GitHub/LinkedIn URLs correct
- [ ] Contact form configured (optional)
- [ ] SEO meta tags updated
- [ ] Repository name matches configuration
- [ ] GitHub Pages enabled
- [ ] Build completes successfully
- [ ] All links work correctly

Your FAANG-level portfolio is ready to impress recruiters! 🚀