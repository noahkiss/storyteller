import { ReactNode } from 'react';
import { Allotment } from 'allotment';
import 'allotment/dist/style.css';
import './SplitLayout.css';

interface SplitLayoutProps {
  leftContent: ReactNode;
  rightContent: ReactNode;
}

export function SplitLayout({ leftContent, rightContent }: SplitLayoutProps) {
  return (
    <div className="split-layout">
      <Allotment>
        <Allotment.Pane minSize={250} preferredSize="30%">
          <div className="split-layout__left">
            {leftContent}
          </div>
        </Allotment.Pane>
        <Allotment.Pane>
          <div className="split-layout__right">
            {rightContent}
          </div>
        </Allotment.Pane>
      </Allotment>
    </div>
  );
}
