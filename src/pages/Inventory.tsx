import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/hooks/useI18n";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Package, Plus, AlertTriangle, TrendingDown, Search, Pill,
  ShoppingCart, Edit, Trash2, ArrowDownUp
} from "lucide-react";

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  sku: string | null;
  quantity: number;
  min_quantity: number;
  unit: string;
  purchase_price: number;
  selling_price: number;
  expiry_date: string | null;
  supplier: string | null;
  clinic_id: string | null;
  created_at: string;
}

interface InventoryTransaction {
  id: string;
  item_id: string;
  transaction_type: string;
  quantity: number;
  patient_id: string | null;
  notes: string | null;
  created_at: string;
}

export default function Inventory() {
  const { lang } = useI18n();
  const { toast } = useToast();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [sellOpen, setSellOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [sellQty, setSellQty] = useState(1);

  // Form state
  const [form, setForm] = useState({
    name: "", category: "medicine", quantity: 0, min_quantity: 10,
    unit: "piece", purchase_price: 0, selling_price: 0,
    expiry_date: "", supplier: "", sku: ""
  });

  const fetchData = async () => {
    const [{ data: itemsData }, { data: txData }] = await Promise.all([
      supabase.from("inventory_items").select("*").order("name"),
      supabase.from("inventory_transactions").select("*").order("created_at", { ascending: false }).limit(50)
    ]);
    if (itemsData) setItems(itemsData as InventoryItem[]);
    if (txData) setTransactions(txData as InventoryTransaction[]);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const filteredItems = items.filter(i =>
    i.name.toLowerCase().includes(search.toLowerCase()) ||
    (i.sku && i.sku.includes(search))
  );

  const lowStockItems = items.filter(i => i.quantity <= i.min_quantity);
  const expiredItems = items.filter(i => i.expiry_date && new Date(i.expiry_date) < new Date());
  const totalValue = items.reduce((s, i) => s + (i.quantity * i.selling_price), 0);

  const addItem = async () => {
    if (!form.name.trim()) return;
    const { error } = await supabase.from("inventory_items").insert({
      name: form.name,
      category: form.category,
      quantity: form.quantity,
      min_quantity: form.min_quantity,
      unit: form.unit,
      purchase_price: form.purchase_price,
      selling_price: form.selling_price,
      expiry_date: form.expiry_date || null,
      supplier: form.supplier || null,
      sku: form.sku || null,
    });
    if (!error) {
      toast({ title: lang === "ar" ? "تمت الإضافة" : "Item added" });
      setAddOpen(false);
      setForm({ name: "", category: "medicine", quantity: 0, min_quantity: 10, unit: "piece", purchase_price: 0, selling_price: 0, expiry_date: "", supplier: "", sku: "" });
      fetchData();
    }
  };

  const sellItem = async () => {
    if (!selectedItem || sellQty <= 0) return;
    const newQty = Math.max(0, selectedItem.quantity - sellQty);
    await supabase.from("inventory_items").update({ quantity: newQty }).eq("id", selectedItem.id);
    await supabase.from("inventory_transactions").insert({
      item_id: selectedItem.id,
      transaction_type: "sale",
      quantity: sellQty,
    });
    toast({ title: lang === "ar" ? "تم البيع" : "Sale recorded" });
    setSellOpen(false);
    setSelectedItem(null);
    setSellQty(1);
    fetchData();
  };

  const deleteItem = async (id: string) => {
    await supabase.from("inventory_items").delete().eq("id", id);
    fetchData();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {lang === "ar" ? "إدارة المخزون والصيدلية" : "Inventory & Pharmacy"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {lang === "ar" ? "إدارة الأدوية والمنتجات" : "Manage medicines & products"}
          </p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 ml-1" />
              {lang === "ar" ? "إضافة منتج" : "Add Product"}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{lang === "ar" ? "إضافة منتج جديد" : "Add New Product"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 pt-2 max-h-[60vh] overflow-y-auto">
              <Input placeholder={lang === "ar" ? "اسم المنتج" : "Product name"} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="medicine">{lang === "ar" ? "دواء" : "Medicine"}</SelectItem>
                  <SelectItem value="consumable">{lang === "ar" ? "مستهلك" : "Consumable"}</SelectItem>
                  <SelectItem value="equipment">{lang === "ar" ? "معدات" : "Equipment"}</SelectItem>
                </SelectContent>
              </Select>
              <div className="grid grid-cols-2 gap-3">
                <Input type="number" placeholder={lang === "ar" ? "الكمية" : "Quantity"} value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: Number(e.target.value) }))} />
                <Input type="number" placeholder={lang === "ar" ? "الحد الأدنى" : "Min quantity"} value={form.min_quantity} onChange={e => setForm(f => ({ ...f, min_quantity: Number(e.target.value) }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input type="number" placeholder={lang === "ar" ? "سعر الشراء" : "Purchase price"} value={form.purchase_price} onChange={e => setForm(f => ({ ...f, purchase_price: Number(e.target.value) }))} />
                <Input type="number" placeholder={lang === "ar" ? "سعر البيع" : "Selling price"} value={form.selling_price} onChange={e => setForm(f => ({ ...f, selling_price: Number(e.target.value) }))} />
              </div>
              <Input type="date" placeholder={lang === "ar" ? "تاريخ الانتهاء" : "Expiry date"} value={form.expiry_date} onChange={e => setForm(f => ({ ...f, expiry_date: e.target.value }))} />
              <Input placeholder={lang === "ar" ? "المورد" : "Supplier"} value={form.supplier} onChange={e => setForm(f => ({ ...f, supplier: e.target.value }))} />
              <Button onClick={addItem} className="w-full">{lang === "ar" ? "إضافة" : "Add"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Package className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{items.length}</p>
              <p className="text-xs text-muted-foreground">{lang === "ar" ? "المنتجات" : "Products"}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{lowStockItems.length}</p>
              <p className="text-xs text-muted-foreground">{lang === "ar" ? "مخزون منخفض" : "Low Stock"}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
              <TrendingDown className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{expiredItems.length}</p>
              <p className="text-xs text-muted-foreground">{lang === "ar" ? "منتهي الصلاحية" : "Expired"}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{totalValue.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">{lang === "ar" ? "قيمة المخزون" : "Stock Value"}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alerts */}
      {lowStockItems.length > 0 && (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-amber-600">
              <AlertTriangle className="h-4 w-4" />
              {lang === "ar" ? "تنبيهات المخزون المنخفض" : "Low Stock Alerts"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {lowStockItems.map(item => (
                <Badge key={item.id} variant="outline" className="border-amber-500/30 text-amber-600">
                  {item.name} ({item.quantity}/{item.min_quantity})
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={lang === "ar" ? "بحث عن منتج..." : "Search products..."}
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pr-10"
        />
      </div>

      {/* Items Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{lang === "ar" ? "المنتج" : "Product"}</TableHead>
                <TableHead>{lang === "ar" ? "النوع" : "Category"}</TableHead>
                <TableHead>{lang === "ar" ? "الكمية" : "Qty"}</TableHead>
                <TableHead>{lang === "ar" ? "السعر" : "Price"}</TableHead>
                <TableHead>{lang === "ar" ? "الصلاحية" : "Expiry"}</TableHead>
                <TableHead>{lang === "ar" ? "إجراءات" : "Actions"}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.map(item => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Pill className="h-4 w-4 text-primary" />
                      <span className="font-medium">{item.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {item.category === "medicine" ? (lang === "ar" ? "دواء" : "Medicine") :
                       item.category === "consumable" ? (lang === "ar" ? "مستهلك" : "Consumable") :
                       (lang === "ar" ? "معدات" : "Equipment")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className={item.quantity <= item.min_quantity ? "text-destructive font-bold" : ""}>
                      {item.quantity}
                    </span>
                    <span className="text-xs text-muted-foreground"> / {item.min_quantity}</span>
                  </TableCell>
                  <TableCell>{item.selling_price}</TableCell>
                  <TableCell>
                    {item.expiry_date ? (
                      <span className={new Date(item.expiry_date) < new Date() ? "text-destructive" : ""}>
                        {item.expiry_date}
                      </span>
                    ) : "-"}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => { setSelectedItem(item); setSellOpen(true); }}
                      >
                        <ShoppingCart className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteItem(item.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredItems.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    {lang === "ar" ? "لا توجد منتجات" : "No products found"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Sell Dialog */}
      <Dialog open={sellOpen} onOpenChange={setSellOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{lang === "ar" ? "تسجيل بيع" : "Record Sale"}</DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4 pt-2">
              <p className="font-medium">{selectedItem.name}</p>
              <p className="text-sm text-muted-foreground">
                {lang === "ar" ? "المتاح:" : "Available:"} {selectedItem.quantity} {selectedItem.unit}
              </p>
              <Input
                type="number"
                min={1}
                max={selectedItem.quantity}
                value={sellQty}
                onChange={e => setSellQty(Number(e.target.value))}
                placeholder={lang === "ar" ? "الكمية" : "Quantity"}
              />
              <p className="text-sm font-medium">
                {lang === "ar" ? "الإجمالي:" : "Total:"} {sellQty * selectedItem.selling_price}
              </p>
              <Button onClick={sellItem} className="w-full">
                {lang === "ar" ? "تسجيل البيع" : "Record Sale"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Need to import DollarSign
import { DollarSign } from "lucide-react";
