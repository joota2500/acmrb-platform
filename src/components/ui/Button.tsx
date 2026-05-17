type Props = {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  variant?: "primary" | "danger" | "secondary";
  disabled?: boolean;
};

export default function Button({
  children,
  onClick,
  type = "button",
  variant = "primary",
  disabled,
}: Props) {

  const variants = {

    primary: `
      bg-[#2E5E4E]
      hover:bg-[#23473B]
      text-white
    `,

    danger: `
      bg-red-500
      hover:bg-red-600
      text-white
    `,

    secondary: `
      bg-zinc-200
      hover:bg-zinc-300
      text-zinc-800
    `,

  };

  return (

    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        h-14
        px-6
        rounded-2xl
        font-bold
        transition-all
        disabled:opacity-50
        disabled:cursor-not-allowed
        ${variants[variant]}
      `}
    >

      {children}

    </button>

  );

}