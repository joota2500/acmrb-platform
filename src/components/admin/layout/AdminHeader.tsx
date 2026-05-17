type Props = {
  title: string;
  description: string;
};

export default function AdminHeader({
  title,
  description,
}: Props) {

  return (

    <div>

      <h1
        className="
          text-4xl
          font-black
          text-[#1F2937]
        "
      >

        {title}

      </h1>

      <p
        className="
          text-zinc-600
          mt-2
          max-w-2xl
          leading-7
        "
      >

        {description}

      </p>

    </div>

  );

}