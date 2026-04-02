interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
}

function Button({ children, className = '', ...props }: ButtonProps) {
    return (
        <button
            className={`flex items-center gap-1.5 bg-stone-900 text-white text-sm font-medium px-4 py-2 rounded-full hover:bg-stone-700 transition-colors ${className}`}
            {...props}
        >
            {children}
        </button>
    );
}

export default Button;
