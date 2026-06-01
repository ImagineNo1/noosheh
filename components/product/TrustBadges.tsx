const trustItems = ['🚚 ارسال سریع و مطمئن', '↻ امکان تعویض تا ۷ روز', '🛡 ضمانت اصالت کالا', '⏱ پشتیبانی ۲۴ ساعته'];

export default function TrustBadges() {
  return <div className="grid grid-cols-2 gap-3 border-y border-border/50 py-4">{trustItems.map((item) => <div key={item} className="text-xs text-muted-foreground">{item}</div>)}</div>;
}
