import heroImage from "@/assets/hero-cheese.jpg";

interface ProductCardProps {
  name: string;
  description: string;
  totalPrice: number;
  totalWeight: number;
  remainingPercent: number;
}

const ProductCard = ({ name, description, totalPrice, totalWeight, remainingPercent }: ProductCardProps) => {
  return (
    <div className="rounded-xl overflow-hidden bg-card border border-border shadow-lg">
      <div className="relative h-64 overflow-hidden">
        <img
          src={heroImage}
          alt={name}
          className="w-full h-full object-cover"
          width={1280}
          height={720}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4">
          <h1 className="text-3xl font-heading font-bold text-primary-foreground">{name}</h1>
          <p className="text-primary-foreground/80 text-sm mt-1">{description}</p>
        </div>
      </div>
      <div className="p-6 grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-sm text-muted-foreground">Valor Total</p>
          <p className="text-xl font-heading font-bold text-foreground">
            R$ {totalPrice.toFixed(2).replace('.', ',')}
          </p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Peso Total</p>
          <p className="text-xl font-heading font-bold text-foreground">{totalWeight.toFixed(1).replace('.', ',')} kg</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Disponível</p>
          <p className="text-xl font-heading font-bold text-success">{remainingPercent}%</p>
        </div>
      </div>
      {/* Progress bar */}
      <div className="px-6 pb-6">
        <div className="w-full h-3 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${100 - remainingPercent}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-1 text-right">{100 - remainingPercent}% reservado</p>
      </div>
    </div>
  );
};

export default ProductCard;
