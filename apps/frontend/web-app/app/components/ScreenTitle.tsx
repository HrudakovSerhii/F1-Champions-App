import React from 'react';

interface ScreenTitleProps {
  title: string;
  'data-testid'?: string;
}

const ScreenTitle: React.FC<ScreenTitleProps> = ({
  title,
  'data-testid': dataTestId,
}) => {
  return (
    <div role="textbox" className="w-full max-w-screen-xl p-4">
      <h2
        className="text-lg text-gray-600 font-medium"
        data-testid={dataTestId}
      >
        {title}
      </h2>
    </div>
  );
};

export default ScreenTitle;
