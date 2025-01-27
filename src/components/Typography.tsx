import React from "react";

export const Typography = (p: {
  children: React.ReactNode;
  fullPage?: boolean;
  wide?: boolean;
}) => {
  const wide = p.wide ?? true;
  const wideClass = wide ? "" : "max-w-3xl";
  return (
    <div className={`prose ${wideClass} ${p.fullPage ? "px-2 py-2 md:px-2 md:py-8" : ""} mx-auto`}>
      {p.children}
    </div>
  );
};
