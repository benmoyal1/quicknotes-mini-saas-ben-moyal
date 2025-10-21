import React, { useState } from 'react';

interface TagFilterProps {
  allTags: string[];
  selectedTags: string[];
  onTagToggle: (tags: string[]) => void;
}

const TagFilter: React.FC<TagFilterProps> = ({ allTags, selectedTags, onTagToggle }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleTagClick = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onTagToggle(selectedTags.filter(t => t !== tag));
    } else {
      onTagToggle([...selectedTags, tag]);
    }
  };

  const handleClearAll = () => {
    onTagToggle([]);
  };

  return (
    <div className="tag-filter">
      <button
        className="filter-toggle"
        onClick={() => setIsOpen(!isOpen)}
      >
        Filter by Tags
        {selectedTags.length > 0 && (
          <span className="filter-count">{selectedTags.length}</span>
        )}
      </button>

      {isOpen && (
        <div className="filter-dropdown">
          <div className="filter-header">
            <span>Select Tags</span>
            {selectedTags.length > 0 && (
              <button onClick={handleClearAll} className="clear-btn">
                Clear All
              </button>
            )}
          </div>

          {allTags.length === 0 ? (
            <p className="no-tags">No tags available</p>
          ) : (
            <div className="tag-list">
              {allTags.map(tag => (
                <label key={tag} className="tag-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedTags.includes(tag)}
                    onChange={() => handleTagClick(tag)}
                  />
                  <span>{tag}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TagFilter;
