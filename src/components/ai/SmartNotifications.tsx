import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { OpenAI } from 'openai';

interface Notification {
  id: string;
  message: string;
  type: 'proactive' | 'bonus' | 'reminder' | 'timing';
  read: boolean;
}

export default function SmartNotifications({ userId }: { userId: string }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    async function fetchNotifications() {
      const supabase = createClient();
      // Fetch upcoming transactions, bonus activations, unused benefits
      const { data: cards } = await supabase.from('cards').select('*').eq('user_id', userId);
      const { data: bonuses } = await supabase.from('bonus_categories').select('*').eq('user_id', userId);
      // Use OpenAI to generate smart notifications
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const prompt = `Generate proactive notifications for user based on cards: ${JSON.stringify(cards)}, bonuses: ${JSON.stringify(bonuses)}`;
      const completion = await openai.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'gpt-4',
      });
      // Assume OpenAI returns array of notifications
      let aiNotifications: Notification[] = [];
      try {
        aiNotifications = JSON.parse(completion.choices[0].message.content || '[]');
      } catch {}
      setNotifications(aiNotifications);
    }
    fetchNotifications();
  }, [userId]);

  return (
    <div className="space-y-4">
      {notifications.map(n => (
        <div key={n.id} className={`p-4 rounded shadow ${n.read ? 'bg-gray-100' : 'bg-blue-50'}`}>
          <span className="font-semibold">{n.type.toUpperCase()}</span>: {n.message}
        </div>
      ))}
      {notifications.length === 0 && <div className="text-gray-500">No notifications yet.</div>}
    </div>
  );
}
