# 🧪 Manual Testing Guide - Phase 4A

## Prerequisites
✅ Dev server running at http://localhost:5173/  
✅ Browser open to the application  

## 🔍 Test 1: Application Startup & Console Check

**Steps:**
1. Open browser dev tools (F12)
2. Go to Console tab
3. Refresh the page (F5)
4. Look for these console messages:

**Expected Console Output:**
```
🎯 Design System Status: { configured: true, theme: "default" | "custom" }
✅ Using Aurelia 2 + MS FAST standard integration
✅ FAST components registered successfully
```

**Check for:**
- [ ] No red error messages
- [ ] Design system status message appears
- [ ] FAST integration message appears
- [ ] Page loads without JavaScript errors

---

## 🔍 Test 2: Visual Component Inspection

**What you should see:**
1. **Exchange Component (Top Section):**
   - A form with MS FAST input fields
   - A table with data
   - Buttons with MS FAST styling
   - Dropdown selects

2. **Orders Display (Bottom Section):**
   - Another table showing order information
   - Action buttons

**Check for:**
- [ ] Components render without visual errors
- [ ] FAST styling is applied (modern, clean look)
- [ ] No broken layouts or overlapping elements
- [ ] Text is readable and properly sized

---

## 🔍 Test 3: FAST Form Component Testing

**In the Exchange Component, test these FAST elements:**

### Text Fields:
- [ ] Click in input fields - they should highlight/focus
- [ ] Type text - should appear normally
- [ ] Check placeholder text displays when empty

### Select Dropdowns:
- [ ] Click dropdown - options should appear
- [ ] Select an option - it should update the field
- [ ] Dropdown should close after selection

### Checkboxes:
- [ ] Click checkboxes - they should toggle on/off
- [ ] Visual state should change clearly

### Buttons:
- [ ] Hover over buttons - should show hover effect
- [ ] Click buttons - should provide visual feedback
- [ ] Disabled buttons should look disabled and not respond

---

## 🔍 Test 4: FAST Table Testing

**Check both tables in the application:**

- [ ] **Headers display correctly**
- [ ] **Data rows are visible and aligned**
- [ ] **Table borders and styling look professional**
- [ ] **Sorting works (if implemented) - click column headers**
- [ ] **Table is responsive (resize browser window)**

---

## 🔍 Test 5: Modal Testing

**Trigger the order confirmation modal:**
1. Make some selections in the exchange component
2. Click a button that should open the modal

**Expected:**
- [ ] **Modal opens with smooth animation**
- [ ] **Modal backdrop/overlay appears**
- [ ] **Modal content displays correctly**
- [ ] **Alert styling shows properly (colored backgrounds)**
- [ ] **Badge styling displays correctly**
- [ ] **Modal can be closed (X button or Cancel)**
- [ ] **Modal closes with smooth animation**

---

## 🔍 Test 6: Theme System Testing

**Check if theme switching works:**
1. Open browser console
2. Try running: `window.toggleTheme()` (if available)
3. Or look for theme switching UI

**Expected:**
- [ ] **Colors change when theme switches**
- [ ] **FAST components update their appearance**
- [ ] **No visual glitches during transition**

---

## 🔍 Test 7: Responsive Design Testing

**Test different screen sizes:**
1. Desktop: 1920x1080 (normal browser window)
2. Laptop: 1366x768 (smaller window)
3. Tablet: 768x1024 (narrow window)
4. Mobile: 375x667 (very narrow)

**Use browser dev tools:**
- Press F12
- Click device toolbar icon (📱)
- Select different device sizes

**Check for:**
- [ ] **Components stack/reflow appropriately**
- [ ] **Text remains readable at all sizes**
- [ ] **Tables scroll horizontally if needed**
- [ ] **Buttons remain clickable**
- [ ] **Modal fits on smaller screens**

---

## 🔍 Test 8: Keyboard Accessibility

**Test keyboard navigation:**
- [ ] **Press Tab - focus should move between interactive elements**
- [ ] **Focus indicators are clearly visible**
- [ ] **Enter/Space activates buttons**
- [ ] **Arrow keys work in dropdowns/tables**
- [ ] **Escape closes modals**
- [ ] **Tab order is logical (left-to-right, top-to-bottom)**

---

## 📊 Performance Check

**In dev tools Performance tab:**
1. Record a page load
2. Check for:
   - [ ] **Page loads in under 3 seconds**
   - [ ] **No memory leaks**
   - [ ] **Smooth animations**

---

## 🐛 Issue Reporting Template

**If you find any issues, report them like this:**

```
**Issue Type:** [Critical/Minor/Enhancement]
**Component:** [Exchange/Orders/Modal/etc.]
**Description:** What you observed vs. what you expected
**Steps to Reproduce:** 
1. 
2. 
3. 
**Browser:** Chrome/Firefox/Edge/Safari
**Screen Size:** Desktop/Tablet/Mobile
```

---

## ✅ Testing Completion

Once you've completed all tests, let me know:
1. How many test categories passed
2. Any issues you found
3. Overall impression of the MS FAST conversion

This will help us determine if we need any fixes or if the conversion is ready for production!
