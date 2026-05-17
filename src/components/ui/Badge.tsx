type Props = {
  children: React.ReactNode;
  variant?: "success" | "warning" | "info";
};

export default function Badge({
  children,
  variant = "success",
}: Props) {

  const variants = {

    success: `
      bg-emerald-100
      text-emerald-700
    `,

    warning: `
      bg-yellow-100
      text-yellow-700
    `,

    info: `
      bg-blue-100
      text-blue-700
    `,

  };

  return (

    <span
      className={`
        px-4
        py-2
        rounded-full
        text-sm
        font-bold
        ${variants[variant]}
      `}
    >

      {children}

    </span>

  );

}