import { cn } from "@/utils/cn";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isSubmitting?: boolean;
  Initial?: string;
  Loading?: string;
}


const Button = ({ isSubmitting, Initial, Loading, onClick ,className,...props}: ButtonProps) => {
  return (
    <button
      type="submit"
      disabled={isSubmitting}
      className={cn('w-full py-3 text-white font-medium rounded-xl',
                 'bg-accent hover:shadow-lg shadow-sm',
                 'hover:opacity-90 transition-opacity cursor-pointer',
                 'disabled:opacity-50 disabled:cursor-not-allowed',className)}
      onClick={onClick}
      {...props}
    >
      {isSubmitting ? Loading : Initial}
    </button>
  );
};

export default Button;
