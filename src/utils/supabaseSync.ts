import { supabase } from '../lib/supabaseClient';
import { Group, Member, Expense } from '../types';

/**
 * Pushes local state to Supabase.
 * For demo/MVP sync, this upserts groups, deletes old member list on the group, 
 * insert new members, and upserts group expenses.
 */
export async function pushToSupabase(groups: Group[]): Promise<{ success: boolean; message: string }> {
  if (!supabase) return { success: false, message: 'Supabase client is not initialized.' };

  try {
    for (const group of groups) {
      // 1. Sync active group meta
      const { error: groupError } = await supabase.from('groups').upsert({
        id: group.id,
        name: group.name,
        icon: group.icon,
        description: group.description
      });

      if (groupError) throw groupError;

      // 2. Delete and insert members to handle list changes cleanly
      const { error: clearMembersError } = await supabase
        .from('members')
        .delete()
        .eq('group_id', group.id);

      if (clearMembersError) throw clearMembersError;

      if (group.members && group.members.length > 0) {
        const membersData = group.members.map(m => ({
          id: m.id,
          group_id: group.id,
          name: m.name,
          avatar_url: m.avatarUrl || null,
          color: m.color,
          duit_now_id: m.duitNowId || null,
          bank_name: m.bankName || null,
          qr_code_data_url: m.qrCodeDataUrl || null
        }));

        const { error: insertMembersError } = await supabase
          .from('members')
          .insert(membersData);

        if (insertMembersError) throw insertMembersError;
      }

      // 3. Upsert expenses
      if (group.expenses && group.expenses.length > 0) {
        const expensesData = group.expenses.map(e => ({
          id: e.id,
          group_id: group.id,
          title: e.title,
          amount: e.amount,
          date: e.date,
          category: e.category,
          paid_by: e.paidBy,
          split_type: e.splitType,
          splits: e.splits,
          receipt_url: e.receiptUrl || null,
          itemized_items: e.itemizedItems || null,
          service_charge_active: e.serviceChargeActive || false,
          sst_active: e.sstActive || false,
          custom_service_charge_rate: e.customServiceChargeRate || null,
          custom_sst_rate: e.customSstRate || null
        }));

        const { error: upsertExpensesError } = await supabase
          .from('expenses')
          .upsert(expensesData);

        if (upsertExpensesError) throw upsertExpensesError;
      }
    }

    return { 
      success: true, 
      message: `Successfully uploaded ${groups.length} groups & balances database to Supabase Cloud!` 
    };
  } catch (err: any) {
    console.error('Push sync error:', err);
    return { 
      success: false, 
      message: err?.message || 'Database sync failed. Ensure your Supabase SQL tables are initialized.' 
    };
  }
}

/**
 * Pulls all groups, members, and expenses from Supabase.
 */
export async function pullFromSupabase(): Promise<{ success: boolean; data?: Group[]; message: string }> {
  if (!supabase) return { success: false, message: 'Supabase client is not initialized.' };

  try {
    const { data: dbGroups, error: groupsError } = await supabase
      .from('groups')
      .select('*');

    if (groupsError) throw groupsError;

    if (!dbGroups || dbGroups.length === 0) {
      return { 
        success: true, 
        data: [], 
        message: 'No groups are available on your Supabase Cloud Database.' 
      };
    }

    const compiledGroups: Group[] = [];

    for (const group of dbGroups) {
      // Fetch members
      const { data: dbMembers, error: membersError } = await supabase
        .from('members')
        .select('*')
        .eq('group_id', group.id);

      if (membersError) throw membersError;

      // Fetch expenses
      const { data: dbExpenses, error: expensesError } = await supabase
        .from('expenses')
        .select('*')
        .eq('group_id', group.id);

      if (expensesError) throw expensesError;

      const formattedMembers: Member[] = (dbMembers || []).map(m => ({
        id: m.id,
        name: m.name,
        avatarUrl: m.avatar_url || undefined,
        color: m.color,
        duitNowId: m.duit_now_id || undefined,
        bankName: m.bank_name || undefined,
        qrCodeDataUrl: m.qr_code_data_url || undefined
      }));

      const formattedExpenses: Expense[] = (dbExpenses || []).map(e => ({
        id: e.id,
        title: e.title,
        amount: Number(e.amount),
        date: e.date,
        category: e.category,
        paidBy: e.paid_by,
        splitType: e.split_type as any,
        splits: e.splits,
        receiptUrl: e.receipt_url || undefined,
        itemizedItems: e.itemized_items || undefined,
        serviceChargeActive: e.service_charge_active,
        sstActive: e.sst_active,
        customServiceChargeRate: e.custom_service_charge_rate ? Number(e.custom_service_charge_rate) : undefined,
        customSstRate: e.custom_sst_rate ? Number(e.custom_sst_rate) : undefined
      }));

      compiledGroups.push({
        id: group.id,
        name: group.name,
        icon: group.icon || '👥',
        description: group.description || '',
        members: formattedMembers,
        expenses: formattedExpenses
      });
    }

    return { 
      success: true, 
      data: compiledGroups, 
      message: `Successfully retrieved ${compiledGroups.length} bill-split groups from Supabase Cloud Database.` 
    };
  } catch (err: any) {
    console.error('Pull sync error:', err);
    return { 
      success: false, 
      message: err?.message || 'Pull failed. Make sure you pasted the exact DDL schema setup in Supabase SQL editor.' 
    };
  }
}
