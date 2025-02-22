export const PasswordInput = (p: {
  disabled?: boolean;
  value: string;
  onChange: (x: string) => void;
  onBlur?: (x: string) => void;
}) => {
  return (
    <label className="form-control w-full">
      <div className="label">
        <span className="label-text">Password</span>
      </div>
      <div className="input input-bordered flex w-full items-center gap-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 16 16"
          fill="currentColor"
          className="h-4 w-4 opacity-70"
          style={{ width: "30px", height: "30px", opacity: "0.7" }}
        >
          <path
            fillRule="evenodd"
            d="M14 6a4 4 0 0 1-4.899 3.899l-1.955 1.955a.5.5 0 0 1-.353.146H5v1.5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-2.293a.5.5 0 0 1 .146-.353l3.955-3.955A4 4 0 1 1 14 6Zm-4-2a.75.75 0 0 0 0 1.5.5.5 0 0 1 .5.5.75.75 0 0 0 1.5 0 2 2 0 0 0-2-2Z"
            clipRule="evenodd"
          />
        </svg>
        <input
          value={p.value}
          disabled={p.disabled}
          onChange={(e) => p.onChange(e.target.value)}
          onBlur={() => {
            if (p.onBlur) p.onBlur(p.value);
          }}
          type="password"
          className="w-full"
        />
      </div>
    </label>
  );
};
