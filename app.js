// Global variables
let allCourses = [];
let filteredCourses = [];
let selectedDepartment = '';

// DOM elements
const courseList = document.getElementById('courseList');
const searchInput = document.getElementById('searchInput');
const departmentFilter = document.getElementById('departmentFilter');
const levelFilter = document.getElementById('levelFilter');
const courseCount = document.getElementById('courseCount');
const departmentCount = document.getElementById('departmentCount');
const departmentButtons = document.getElementById('departmentButtons');
const clearFiltersBtn = document.getElementById('clearFilters');

// Load courses on page load
document.addEventListener('DOMContentLoaded', async () => {
    await loadCourses();
    populateFilters();
    createDepartmentButtons();
    displayCourses();
    setupEventListeners();
    updateStats();
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

// Create department filter buttons
function createDepartmentButtons() {
    const departments = [...new Set(allCourses.map(course => course.department))].sort();
    
    // Create "All" button
    const allBtn = document.createElement('button');
    allBtn.className = 'dept-btn active';
    allBtn.textContent = 'All Departments';
    allBtn.dataset.department = '';
    departmentButtons.appendChild(allBtn);
    
    // Create button for each department
    departments.forEach(dept => {
        const btn = document.createElement('button');
        btn.className = 'dept-btn';
        btn.textContent = dept;
        btn.dataset.department = dept;
        departmentButtons.appendChild(btn);
    });
}

// Update statistics
function updateStats() {
    const departments = new Set(filteredCourses.map(course => course.department));
    courseCount.textContent = filteredCourses.length;
    departmentCount.textContent = departments.size;
}

// Display courses
function displayCourses() {
    if (filteredCourses.length === 0) {
        courseList.innerHTML = '<div class="no-courses">No courses found matching your criteria.</div>';
        updateStats();
        return;
    }

    courseList.innerHTML = filteredCourses.map(course => createCourseCard(course)).join('');
    updateStats();
    
    // Add fade-in animation
    setTimeout(() => {
        document.querySelectorAll('.course-card').forEach((card, index) => {
            setTimeout(() => {
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px)';
                card.style.transition = 'all 0.3s ease';
                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, index * 30);
            }, 0);
        });
    }, 0);
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
    const selectedLevel = levelFilter.value;

    filteredCourses = allCourses.filter(course => {
        // Search filter
        const matchesSearch = !searchTerm || 
            course.courseCode.toLowerCase().includes(searchTerm) ||
            course.title.toLowerCase().includes(searchTerm) ||
            course.department.toLowerCase().includes(searchTerm) ||
            course.description.toLowerCase().includes(searchTerm);

        // Department filter (from buttons or dropdown)
        const matchesDepartment = !selectedDepartment || 
            course.department === selectedDepartment;

        // Level filter
        const matchesLevel = !selectedLevel || 
            course.level.toString() === selectedLevel;

        return matchesSearch && matchesDepartment && matchesLevel;
    });

    displayCourses();
}

// Handle department button clicks
function handleDepartmentButtonClick(event) {
    if (event.target.classList.contains('dept-btn')) {
        // Remove active class from all buttons
        document.querySelectorAll('.dept-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Add active class to clicked button
        event.target.classList.add('active');
        
        // Update selected department
        selectedDepartment = event.target.dataset.department;
        
        // Sync dropdown
        departmentFilter.value = selectedDepartment;
        
        // Filter courses
        filterCourses();
    }
}

// Handle dropdown change
function handleDropdownChange() {
    selectedDepartment = departmentFilter.value;
    
    // Update button active state
    document.querySelectorAll('.dept-btn').forEach(btn => {
        if (btn.dataset.department === selectedDepartment) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    filterCourses();
}

// Clear all filters
function clearAllFilters() {
    // Reset selected department
    selectedDepartment = '';
    
    // Reset search
    searchInput.value = '';
    
    // Reset level filter
    levelFilter.value = '';
    
    // Reset dropdown
    departmentFilter.value = '';
    
    // Reset button states
    document.querySelectorAll('.dept-btn').forEach(btn => {
        if (btn.dataset.department === '') {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    // Reset and display all courses
    filterCourses();
}

// Setup event listeners
function setupEventListeners() {
    searchInput.addEventListener('input', filterCourses);
    departmentButtons.addEventListener('click', handleDepartmentButtonClick);
    departmentFilter.addEventListener('change', handleDropdownChange);
    levelFilter.addEventListener('change', filterCourses);
    clearFiltersBtn.addEventListener('click', clearAllFilters);
}

// Utility function to get course by code (for future features)
function getCourseByCode(courseCode) {
    return allCourses.find(course => course.courseCode === courseCode);
}

// Get courses by department
function getCoursesByDepartment(department) {
    return allCourses.filter(course => course.department === department);
}

// Export functions for potential testing or extension
window.CourseApp = {
    getCourseByCode,
    getCoursesByDepartment,
    filterCourses,
    displayCourses,
    clearAllFilters
};