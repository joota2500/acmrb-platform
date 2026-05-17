type Props = {
  title: string;
  description?: string;
};

export default function SectionTitle({
  title,
  description,
}: Props) {

  return (

    <div className="mb-8">

      <h2
        className="
          text-4xl
          font-black
          text-[#1F2937]
        "
      >

        {title}

      </h2>

      {description && (

        <p
          className="
            text-zinc-500
            mt-3
            leading-8
            max-w-3xl
          "
        >

          {description}

        </p>

      )}

    </div>

  );

}