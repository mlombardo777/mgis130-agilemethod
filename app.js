// Global variables
let allCourses = [];
let filteredCourses = [];

// DOM elements
const courseList = document.getElementById('courseList');
const searchInput = document.getElementById('searchInput');
const departmentFilter = document.getElementById('departmentFilter');
const levelFilter = document.getElementById('levelFilter');
const courseCount = document.getElementById('courseCount');

// Load courses on page load
document.addEventListener('DOMContentLoaded', async () => {
    await loadCourses();
    populateFilters();
    displayCourses();
    setupEventListeners();
});

// Load courses from JSON file
async function loadCourses() {
    try {
        const response = await fetch('rit_courses.json');
        const data = await response.json();
        allCourses = data.courses;
        filteredCourses = [...allCourses];
        console.log(`Loaded ${allCourses.length} courses`);
    } catch (error) {
        console.error('Error loading courses:', error);
        courseList.innerHTML = '<div class="no-courses">Error loading courses. Please try again.</div>';
    }
}

// Populate department filter dropdown
function populateFilters() {
    const departments = [...new Set(allCourses.map(course => course.department))].sort();
    
    departments.forEach(dept => {
        const option = document.createElement('option');
        option.value = dept;
        option.textContent = dept;
        departmentFilter.appendChild(option);
    });
}

// Display courses
function displayCourses() {
    if (filteredCourses.length === 0) {
        courseList.innerHTML = '<div class="no-courses">No courses found matching your criteria.</div>';
        courseCount.textContent = 'No courses found';
        return;
    }

    courseList.innerHTML = filteredCourses.map(course => createCourseCard(course)).join('');
    courseCount.textContent = `Showing ${filteredCourses.length} of ${allCourses.length} courses`;
}

// Create HTML for a course card
function createCourseCard(course) {
    const prerequisitesHTML = course.prerequisites.length > 0
        ? `<div class="prerequisites">
             <span class="prereq-label">Prerequisites:</span> ${course.prerequisites.join(', ')}
           </div>`
        : '';

    const termsHTML = course.terms.map(term => 
        `<span class="term-tag">${term}</span>`
    ).join('');

    return `
        <div class="course-card">
            <div class="course-header">
                <div class="course-code">${course.courseCode}</div>
                <div class="course-title">${course.title}</div>
            </div>
            
            <div class="course-meta">
                <span class="department-badge">${course.department}</span>
                <span class="credits-badge">${course.credits} Credits</span>
            </div>
            
            <div class="course-description">
                ${course.description}
            </div>
            
            <div class="course-footer">
                <div class="terms">
                    ${termsHTML}
                </div>
            </div>
            
            ${prerequisitesHTML}
        </div>
    `;
}

// Filter courses based on search and filters
function filterCourses() {
    const searchTerm = searchInput.value.toLowerCase();
    const selectedDepartment = departmentFilter.value;
    const selectedLevel = levelFilter.value;

    filteredCourses = allCourses.filter(course => {
        // Search filter
        const matchesSearch = !searchTerm || 
            course.courseCode.toLowerCase().includes(searchTerm) ||
            course.title.toLowerCase().includes(searchTerm) ||
            course.department.toLowerCase().includes(searchTerm) ||
            course.description.toLowerCase().includes(searchTerm);

        // Department filter
        const matchesDepartment = !selectedDepartment || 
            course.department === selectedDepartment;

        // Level filter
        const matchesLevel = !selectedLevel || 
            course.level.toString() === selectedLevel;

        return matchesSearch && matchesDepartment && matchesLevel;
    });

    displayCourses();
}

// Setup event listeners
function setupEventListeners() {
    searchInput.addEventListener('input', filterCourses);
    departmentFilter.addEventListener('change', filterCourses);
    levelFilter.addEventListener('change', filterCourses);
}

// Utility function to get course by code (for future features)
function getCourseByCode(courseCode) {
    return allCourses.find(course => course.courseCode === courseCode);
}

// Export functions for potential testing or extension
window.CourseApp = {
    getCourseByCode,
    filterCourses,
    displayCourses
};
```

## **File Structure:**
```
rit-course-registration/
├── index.html          ← Main HTML file
├── styles.css          ← All the styling
├── app.js              ← JavaScript functionality
└── rit_courses.json    ← Your course data