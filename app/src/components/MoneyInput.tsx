"use client";

/**
 * Input số tiền — hiển thị có dấu phân cách nghìn (vd 1.234.567) để người nhập dễ
 * soát số lượng số 0, nhưng value/onChange vẫn truyền chuỗi số thuần (vd "1234567")
 * để chỗ gọi dùng Number(value) như input type="number" bình thường.
 */
export default function MoneyInput({
  value,
  onChange,
  className = "input",
  placeholder,
  onClick,
}: {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
  onClick?: (e: React.MouseEvent<HTMLInputElement>) => void;
}) {
  const hienThi = value ? Number(value).toLocaleString("vi-VN") : "";

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    onChange(e.target.value.replace(/\D/g, ""));
  }

  return (
    <input
      type="text"
      inputMode="numeric"
      className={className}
      placeholder={placeholder}
      value={hienThi}
      onChange={handleChange}
      onClick={onClick}
    />
  );
}
