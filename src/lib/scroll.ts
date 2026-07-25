export const smoothScrollTo = (id: string) => {
  const element = document.getElementById(id);
  if (element) {
    const headerOffset = 90; // altura aproximada do header fixo
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.scrollY - headerOffset;

    window.scrollTo({
      top: offsetPosition,
      behavior: "smooth",
    });
  }
};
