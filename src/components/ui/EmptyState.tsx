type Props = {
  title: string;
  description: string;
};

export default function EmptyState({
  title,
  description,
}: Props) {

  return (

    <div
      className="
        bg-white
        border
        border-black/5
        rounded-4xl
        p-16
        text-center
      "
    >

      <h2
        className="
          text-3xl
          font-black
          text-zinc-900
        "
      >

        {title}

      </h2>

      <p
        className="
          text-zinc-500
          mt-4
          max-w-xl
          mx-auto
          leading-8
        "
      >

        {description}

      </p>

    </div>

  );

}