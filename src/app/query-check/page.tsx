"use client";

import { Button } from "@/components/ui/button";
import { useAuthRedux } from "@/hooks/useAuthRedux";
import { database } from "@/lib/firebase";
import { ref, set } from "firebase/database";
import React from "react";

const QueryCheck = () => {
  const { authUser } = useAuthRedux();

  const handleQuery = () => {
    if (authUser) {
      const ticketRef = ref(database, "tickets/".concat(authUser.uid.concat('/ratings')));
      set(ticketRef, {
        rating: 5,
        comment: "This is a comment",
        createdAt: new Date().toISOString()
      });
    }
  };

  return (
    <div>
      <Button variant={"default"} onClick={handleQuery}>
        Run Query
      </Button>
    </div>
  );
};

export default QueryCheck;
