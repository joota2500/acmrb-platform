type Props = {
  children: React.ReactNode;
  className?: string;
};

export default function Card({
  children,
  className = "",
}: Props) {

  return (

    <div
      className={`
        bg-white
        border
        border-black/5
        rounded-4xl
        shadow-sm
        ${className}
      `}
    >

      {children}

    </div>

  );

}