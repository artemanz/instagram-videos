"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { FormEvent, useState } from "react";

const Form = () => {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [link, setLink] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setLink(null);
    setError(null);

    try {
      const res = await fetch(process.env.NEXT_PUBLIC_API! + "/download", {
        method: "POST",
        body: JSON.stringify({ username }),
      });

      const data = await res.json();
      if (res.status !== 200) throw new Error(data.error);

      setLink(data);
    } catch (error) {
      if (error instanceof Error) setError(error.message);
      else setError("Server error");
    }

    setLoading(false);
  };

  return (
    <div className="py-8 max-w-sm mx-auto text-center">
      <form className="flex flex-col gap-4 mb-4" onSubmit={(e) => submit(e)}>
        <div className="flex gap-4">
          <Input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            type="text"
            placeholder="Username"
          />
          <Button
            className="w-24"
            type="submit"
            disabled={loading || !username}
          >
            {loading ? <Loader2 className="animate-spin" /> : "Найти"}
          </Button>
        </div>
      </form>

      {error && <p className="text-destructive">{error}</p>}

      {link && (
        <a className="text-2xl" href={link} download>
          Скачать
        </a>
      )}
    </div>
  );
};

export { Form };
