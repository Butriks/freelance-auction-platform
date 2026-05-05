import React from 'react';

function PageSection({
  eyebrow,
  title,
  description,
  action,
  children,
}) {
  return (
    <section className="page-section">
      <div className="page-section__header">
        <div>
          {eyebrow ? <p className="page-section__eyebrow">{eyebrow}</p> : null}
          <h2 className="page-section__title">{title}</h2>
          {description ? <p className="page-section__description">{description}</p> : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export default PageSection;
