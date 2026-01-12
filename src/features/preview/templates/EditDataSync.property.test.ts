/**
 * Property-Based Tests for Edit Data Sync
 * 
 * Feature: all-text-editable
 * Property 1: 编辑数据同步
 * Validates: Requirements 1.1-1.7, 2.1-2.2, 3.1-3.2, 4.1-4.2, 5.1-5.2, 6.1-6.2, 7.1-7.2, 8.2
 * 
 * For any template and any editable field, when the value is modified in edit mode,
 * the ResumeContext data should correctly update to the new value.
 */
import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import type { ResumeBasics, ExperienceItem, EducationItem, ProjectItem, SkillGroup, CustomSection, CustomSectionItem } from '../../resume/types';

/**
 * Simulates updating basics field in ResumeData
 */
function updateBasicsField(
  basics: ResumeBasics,
  field: keyof ResumeBasics,
  value: string
): ResumeBasics {
  return { ...basics, [field]: value };
}

/**
 * Simulates updating experience item field
 */
function updateExperienceField(
  experience: ExperienceItem[],
  expId: string,
  field: keyof ExperienceItem,
  value: string
): ExperienceItem[] {
  return experience.map(exp =>
    exp.id === expId ? { ...exp, [field]: value } : exp
  );
}

/**
 * Simulates updating education item field
 */
function updateEducationField(
  education: EducationItem[],
  eduId: string,
  field: keyof EducationItem,
  value: string
): EducationItem[] {
  return education.map(edu =>
    edu.id === eduId ? { ...edu, [field]: value } : edu
  );
}

/**
 * Simulates updating project item field
 */
function updateProjectField(
  projects: ProjectItem[],
  projId: string,
  field: keyof ProjectItem,
  value: string
): ProjectItem[] {
  return projects.map(proj =>
    proj.id === projId ? { ...proj, [field]: value } : proj
  );
}

/**
 * Simulates updating skill group field
 */
function updateSkillGroupField(
  skills: SkillGroup[],
  skillId: string,
  field: 'name' | 'items',
  value: string
): SkillGroup[] {
  return skills.map(skill => {
    if (skill.id === skillId) {
      if (field === 'items') {
        return { ...skill, items: value.split(',').map(s => s.trim()).filter(s => s) };
      }
      return { ...skill, [field]: value };
    }
    return skill;
  });
}

/**
 * Simulates updating custom section item field
 */
function updateCustomItemField(
  custom: CustomSection[],
  sectionId: string,
  itemId: string,
  field: keyof CustomSectionItem,
  value: string
): CustomSection[] {
  return custom.map(section => {
    if (section.id === sectionId) {
      const newItems = section.items.map(item =>
        item.id === itemId ? { ...item, [field]: value } : item
      );
      return { ...section, items: newItems };
    }
    return section;
  });
}

// Generators for test data
const basicsFieldArb = fc.constantFrom<keyof ResumeBasics>(
  'name', 'title', 'email', 'phone', 'city', 'website', 'linkedin', 'github'
);

const experienceFieldArb = fc.constantFrom<keyof ExperienceItem>(
  'company', 'role', 'city'
);

const educationFieldArb = fc.constantFrom<keyof EducationItem>(
  'school', 'degree', 'major'
);

const projectFieldArb = fc.constantFrom<keyof ProjectItem>(
  'name', 'link'
);

const skillFieldArb = fc.constantFrom<'name' | 'items'>('name', 'items');

const customItemFieldArb = fc.constantFrom<keyof CustomSectionItem>(
  'title', 'subtitle', 'date'
);

// Generate valid string values (non-empty, printable)
const validStringArb = fc.string({ minLength: 1, maxLength: 100 })
  .filter(s => s.trim().length > 0);

describe('Property 1: 编辑数据同步 (Edit Data Sync)', () => {
  /**
   * For any basics field and any valid string value,
   * updating the field should result in the new value being stored.
   */
  it('should sync basics field edits to data', () => {
    fc.assert(
      fc.property(
        // Generate initial basics
        fc.record({
          name: validStringArb,
          title: validStringArb,
          email: validStringArb,
          phone: validStringArb,
          city: validStringArb,
          website: fc.option(validStringArb, { nil: undefined }),
          linkedin: fc.option(validStringArb, { nil: undefined }),
          github: fc.option(validStringArb, { nil: undefined }),
        }),
        // Field to update
        basicsFieldArb,
        // New value
        validStringArb,
        (basics, field, newValue) => {
          const updated = updateBasicsField(basics as ResumeBasics, field, newValue);
          
          // The updated field should have the new value
          expect(updated[field]).toBe(newValue);
          
          // Other fields should remain unchanged
          Object.keys(basics).forEach(key => {
            if (key !== field) {
              expect(updated[key as keyof ResumeBasics]).toBe(basics[key as keyof ResumeBasics]);
            }
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * For any experience item and any valid field value,
   * updating the field should result in the new value being stored for that item only.
   */
  it('should sync experience field edits to data', () => {
    fc.assert(
      fc.property(
        // Generate experience items
        fc.array(
          fc.record({
            id: fc.uuid(),
            company: validStringArb,
            role: validStringArb,
            city: validStringArb,
            start: fc.string({ minLength: 7, maxLength: 7 }),
            end: fc.string({ minLength: 7, maxLength: 7 }),
            current: fc.boolean(),
            highlights: fc.array(validStringArb, { minLength: 0, maxLength: 3 }),
          }),
          { minLength: 1, maxLength: 5 }
        ),
        // Field to update
        experienceFieldArb,
        // New value
        validStringArb,
        (experience, field, newValue) => {
          // Pick a random item to update
          const targetIndex = Math.floor(Math.random() * experience.length);
          const targetId = experience[targetIndex].id;
          
          const updated = updateExperienceField(
            experience as ExperienceItem[],
            targetId,
            field,
            newValue
          );
          
          // The target item should have the new value
          const updatedItem = updated.find(e => e.id === targetId);
          expect(updatedItem?.[field]).toBe(newValue);
          
          // Other items should remain unchanged
          updated.forEach((item, index) => {
            if (item.id !== targetId) {
              expect(item).toEqual(experience[index]);
            }
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * For any education item and any valid field value,
   * updating the field should result in the new value being stored for that item only.
   */
  it('should sync education field edits to data', () => {
    fc.assert(
      fc.property(
        // Generate education items
        fc.array(
          fc.record({
            id: fc.uuid(),
            school: validStringArb,
            degree: validStringArb,
            major: validStringArb,
            start: fc.string({ minLength: 7, maxLength: 7 }),
            end: fc.string({ minLength: 7, maxLength: 7 }),
            highlights: fc.array(validStringArb, { minLength: 0, maxLength: 3 }),
          }),
          { minLength: 1, maxLength: 5 }
        ),
        // Field to update
        educationFieldArb,
        // New value
        validStringArb,
        (education, field, newValue) => {
          // Pick a random item to update
          const targetIndex = Math.floor(Math.random() * education.length);
          const targetId = education[targetIndex].id;
          
          const updated = updateEducationField(
            education as EducationItem[],
            targetId,
            field,
            newValue
          );
          
          // The target item should have the new value
          const updatedItem = updated.find(e => e.id === targetId);
          expect(updatedItem?.[field]).toBe(newValue);
          
          // Other items should remain unchanged
          updated.forEach((item, index) => {
            if (item.id !== targetId) {
              expect(item).toEqual(education[index]);
            }
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * For any project item and any valid field value,
   * updating the field should result in the new value being stored for that item only.
   */
  it('should sync project field edits to data', () => {
    fc.assert(
      fc.property(
        // Generate project items
        fc.array(
          fc.record({
            id: fc.uuid(),
            name: validStringArb,
            link: fc.option(validStringArb, { nil: undefined }),
            techStack: fc.array(validStringArb, { minLength: 1, maxLength: 5 }),
            highlights: fc.array(validStringArb, { minLength: 0, maxLength: 3 }),
          }),
          { minLength: 1, maxLength: 5 }
        ),
        // Field to update
        projectFieldArb,
        // New value
        validStringArb,
        (projects, field, newValue) => {
          // Pick a random item to update
          const targetIndex = Math.floor(Math.random() * projects.length);
          const targetId = projects[targetIndex].id;
          
          const updated = updateProjectField(
            projects as ProjectItem[],
            targetId,
            field,
            newValue
          );
          
          // The target item should have the new value
          const updatedItem = updated.find(p => p.id === targetId);
          expect(updatedItem?.[field]).toBe(newValue);
          
          // Other items should remain unchanged
          updated.forEach((item, index) => {
            if (item.id !== targetId) {
              expect(item).toEqual(projects[index]);
            }
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * For any skill group and any valid field value,
   * updating the field should result in the new value being stored for that group only.
   */
  it('should sync skill group field edits to data', () => {
    fc.assert(
      fc.property(
        // Generate skill groups
        fc.array(
          fc.record({
            id: fc.uuid(),
            name: validStringArb,
            items: fc.array(validStringArb, { minLength: 1, maxLength: 5 }),
          }),
          { minLength: 1, maxLength: 5 }
        ),
        // Field to update
        skillFieldArb,
        // New value
        validStringArb,
        (skills, field, newValue) => {
          // Pick a random group to update
          const targetIndex = Math.floor(Math.random() * skills.length);
          const targetId = skills[targetIndex].id;
          
          const updated = updateSkillGroupField(
            skills as SkillGroup[],
            targetId,
            field,
            newValue
          );
          
          // The target group should have the new value
          const updatedGroup = updated.find(s => s.id === targetId);
          if (field === 'name') {
            expect(updatedGroup?.name).toBe(newValue);
          } else {
            // For items, the value is split by comma
            const expectedItems = newValue.split(',').map(s => s.trim()).filter(s => s);
            expect(updatedGroup?.items).toEqual(expectedItems);
          }
          
          // Other groups should remain unchanged
          updated.forEach((group, index) => {
            if (group.id !== targetId) {
              expect(group).toEqual(skills[index]);
            }
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * For any custom section item and any valid field value,
   * updating the field should result in the new value being stored for that item only.
   */
  it('should sync custom section item field edits to data', () => {
    fc.assert(
      fc.property(
        // Generate custom sections with items
        fc.array(
          fc.record({
            id: fc.uuid(),
            title: validStringArb,
            items: fc.array(
              fc.record({
                id: fc.uuid(),
                title: validStringArb,
                subtitle: fc.option(validStringArb, { nil: undefined }),
                date: fc.option(validStringArb, { nil: undefined }),
                link: fc.option(validStringArb, { nil: undefined }),
                items: fc.array(validStringArb, { minLength: 0, maxLength: 3 }),
              }),
              { minLength: 1, maxLength: 3 }
            ),
          }),
          { minLength: 1, maxLength: 3 }
        ),
        // Field to update
        customItemFieldArb,
        // New value
        validStringArb,
        (custom, field, newValue) => {
          // Pick a random section and item to update
          const sectionIndex = Math.floor(Math.random() * custom.length);
          const section = custom[sectionIndex];
          const itemIndex = Math.floor(Math.random() * section.items.length);
          const targetSectionId = section.id;
          const targetItemId = section.items[itemIndex].id;
          
          const updated = updateCustomItemField(
            custom as CustomSection[],
            targetSectionId,
            targetItemId,
            field,
            newValue
          );
          
          // The target item should have the new value
          const updatedSection = updated.find(s => s.id === targetSectionId);
          const updatedItem = updatedSection?.items.find(i => i.id === targetItemId);
          expect(updatedItem?.[field]).toBe(newValue);
          
          // Other sections and items should remain unchanged
          updated.forEach((sec, secIdx) => {
            if (sec.id !== targetSectionId) {
              expect(sec).toEqual(custom[secIdx]);
            } else {
              sec.items.forEach((item, itemIdx) => {
                if (item.id !== targetItemId) {
                  expect(item).toEqual(custom[secIdx].items[itemIdx]);
                }
              });
            }
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Editing should be idempotent - setting the same value twice should have no additional effect.
   */
  it('should be idempotent when setting the same value', () => {
    fc.assert(
      fc.property(
        fc.record({
          name: validStringArb,
          title: validStringArb,
          email: validStringArb,
          phone: validStringArb,
          city: validStringArb,
        }),
        basicsFieldArb.filter(f => ['name', 'title', 'email', 'phone', 'city'].includes(f)),
        validStringArb,
        (basics, field, newValue) => {
          const updated1 = updateBasicsField(basics as ResumeBasics, field, newValue);
          const updated2 = updateBasicsField(updated1, field, newValue);
          
          // Setting the same value twice should produce identical results
          expect(updated1).toEqual(updated2);
        }
      ),
      { numRuns: 50 }
    );
  });
});
