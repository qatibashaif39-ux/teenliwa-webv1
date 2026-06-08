export function Footer() {
    return (
        <footer className="mt-auto border-t border-border/60 bg-background/80 py-8 backdrop-blur-lg">
            <div className="mx-auto max-w-6xl px-4 text-center">
                <p className="text-sm text-muted-foreground">
                    جميع الحقوق محفوظة &copy; {new Date().getFullYear()} م.بلال شائف
                </p>
            </div>
        </footer>
    );
}
