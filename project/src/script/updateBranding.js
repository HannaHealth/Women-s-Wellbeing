/**
 * Script to update branding from "OpenHanna AI" to "HannaHealth" across the codebase
 * 
 * Run with: node src/script/updateBranding.js
 */

const fs = require('fs');
const path = require('path');

const OLD_NAME = 'OpenHanna AI';
const NEW_NAME = 'HannaHealth';
const OLD_ASSISTANT = 'OpenHanna AI assistant';
const NEW_ASSISTANT = 'Hanna™';

// Get list of all project files to scan
const walkSync = (dir, filelist = []) => {
  fs.readdirSync(dir).forEach(file => {
    const dirFile = path.join(dir, file);
    try {
      filelist = fs.statSync(dirFile).isDirectory()
        ? walkSync(dirFile, filelist)
        : filelist.concat(dirFile);
    } catch (err) {
      console.log(`Error accessing ${dirFile}:`, err);
    }
  });
  return filelist;
};

// Skip certain directories
const shouldSkipDir = (filepath) => {
  const skipDirs = [
    '/node_modules/',
    '/.git/',
    '/dist/',
    '/build/',
    '/.bolt/'
  ];
  
  return skipDirs.some(dir => filepath.includes(dir));
};

// Only process certain file extensions
const isProcessableFile = (filepath) => {
  const processableExtensions = [
    '.js',
    '.jsx',
    '.ts',
    '.tsx',
    '.md',
    '.mdx',
    '.html',
    '.json',
    '.css',
    '.scss'
  ];
  
  const ext = path.extname(filepath);
  return processableExtensions.includes(ext);
};

// Main function to update branding in files
const updateBranding = () => {
  console.log(`Updating branding from "${OLD_NAME}" to "${NEW_NAME}"...`);
  
  try {
    // Get all project files
    const projectDir = path.resolve('.');
    const allFiles = walkSync(projectDir);
    
    // Filter files to process
    const filesToProcess = allFiles.filter(file => 
      !shouldSkipDir(file) && isProcessableFile(file)
    );
    
    console.log(`Found ${filesToProcess.length} files to process`);
    
    let filesUpdated = 0;
    let occurrencesReplaced = 0;
    
    // Process each file
    filesToProcess.forEach(file => {
      try {
        let content = fs.readFileSync(file, 'utf8');
        let newContent = content;
        
        // Replace the main platform name
        const platformRegex = new RegExp(OLD_NAME, 'g');
        newContent = newContent.replace(platformRegex, NEW_NAME);
        
        // Replace the assistant name
        const assistantRegex = new RegExp(OLD_ASSISTANT, 'g');
        newContent = newContent.replace(assistantRegex, NEW_ASSISTANT);
        
        // More specific replacements for common patterns
        newContent = newContent.replace(/OpenHanna/g, 'HannaHealth');
        newContent = newContent.replace(/openhanna/g, 'hannahealth');
        
        // If content was changed, write the file
        if (newContent !== content) {
          fs.writeFileSync(file, newContent, 'utf8');
          filesUpdated++;
          
          // Count occurrences
          const platformMatches = (content.match(platformRegex) || []).length;
          const assistantMatches = (content.match(assistantRegex) || []).length;
          const openHannaMatches = (content.match(/OpenHanna/g) || []).length;
          const openhannaMatches = (content.match(/openhanna/g) || []).length;
          
          const totalMatches = platformMatches + assistantMatches + openHannaMatches + openhannaMatches;
          occurrencesReplaced += totalMatches;
          
          console.log(`Updated ${file} (${totalMatches} occurrences)`);
        }
      } catch (err) {
        console.error(`Error processing file ${file}:`, err);
      }
    });
    
    console.log(`\nBranding update complete!`);
    console.log(`Files updated: ${filesUpdated}`);
    console.log(`Total occurrences replaced: ${occurrencesReplaced}`);
    
  } catch (err) {
    console.error('Error updating branding:', err);
  }
};

// Run the branding update
updateBranding();