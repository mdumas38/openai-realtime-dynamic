import React from 'react';
import { Button } from '../button/Button';
import './ExperienceSelector.scss';

interface ExperienceSelectorProps {
  onSelect: (experience: string) => void;
  onBack: () => void;
}

export const ExperienceSelector: React.FC<ExperienceSelectorProps> = ({ onSelect, onBack }) => {
  const experiences = ['Roomz', 'Avatar State', 'Mad Libs AI', 'Talk To Me'];

  return (
    <div className="experience-selector">
      <h2>Select Experience</h2>
      <div className="button-container">
        {experiences.map((experience) => (
          <Button
            key={experience}
            label={experience}
            onClick={() => onSelect(experience)}
            buttonStyle="action"
          />
        ))}
      </div>
      <Button
        label="Back"
        onClick={onBack}
        buttonStyle="regular"
      />
    </div>
  );
};
