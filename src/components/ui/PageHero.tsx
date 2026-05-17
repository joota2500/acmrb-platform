type Props = {
  badge?: string;
  title: string;
  description: string;
};

export default function PageHero({
  badge,
  title,
  description,
}: Props) {

  return (

    <section
      className="
        pt-40
        pb-24
        px-6
      "
    >

      <div className="container-custom">

        {badge && (

          <div className="section-tag mb-6">

            {badge}

          </div>

        )}

        <h1 className="section-title">

          {title}

        </h1>

        <p className="section-description mt-8">

          {description}

        </p>

      </div>

    </section>

  );

}