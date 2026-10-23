import './ScrollSideTabs.scss';

import { useEffect, useState } from 'react';

import SideTabs from './SideTabs';

type SectionConfig = {
  key: string;
  ref: React.RefObject<HTMLElement | null>;
  id: string;
};

type TabItem = {
  key: string;
  label: string;
};

interface Props {
  sections: SectionConfig[];
  tabItems: TabItem[];
}

const ScrollSideTabs = ({ sections, tabItems }: Props) => {
  const [activeTab, setActiveTab] = useState<string>(tabItems[0]?.key || '');

  useEffect(() => {
    const elements = sections
      .map((section) => section.ref.current)
      .filter((el): el is HTMLElement => el !== null);

    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (!visible.length) return;

        const activeId = visible[0].target.id;
        const matched = sections.find((section) => section.id === activeId);

        if (matched) {
          setActiveTab(matched.key);
        }
      },
      {
        root: null,
        threshold: [0.3, 0.6],
        rootMargin: '-88px 0px -40% 0px',
      }
    );

    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [sections]);

  const handleScrollToSection = (key: string) => {
    setActiveTab(key);

    const target = sections.find((section) => section.key === key);
    target?.ref.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  return (
    <SideTabs
      activeTab={activeTab}
      onTabClick={handleScrollToSection}
      items={tabItems}
      className="scroll-side-tabs"
      itemClassName="scroll-side-tabs-item"
      activeClassName="scroll-side-tabs-item-active"
    />
  );
};

export default ScrollSideTabs;
