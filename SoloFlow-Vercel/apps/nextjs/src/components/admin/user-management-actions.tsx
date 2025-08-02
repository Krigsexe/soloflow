'use client';

import { useState } from 'react';
import { MoreHorizontal, Edit, Trash2, Shield, User, Lock, Unlock } from 'lucide-react';

import { Button } from '@soloflow/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@soloflow/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@soloflow/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@soloflow/ui/select';
import { Input } from '@soloflow/ui/input';
import { Label } from '@soloflow/ui/label';
import { Checkbox } from '@soloflow/ui/checkbox';
import { useToast } from '@soloflow/ui/use-toast';

import { createClient } from '~/utils/supabase/client';

interface UserWithProfile {
  id: string;
  email: string;
  full_name: string | null;
  role: 'admin' | 'user';
  permissions: string[];
}

interface UserManagementActionsProps {
  user: UserWithProfile;
  currentUserId: string;
}

const AVAILABLE_PERMISSIONS = [
  { id: 'dashboard.view', label: 'Voir le tableau de bord', category: 'Dashboard' },
  { id: 'dashboard.admin', label: 'Admin tableau de bord', category: 'Dashboard' },
  { id: 'users.view', label: 'Voir les utilisateurs', category: 'Utilisateurs' },
  { id: 'users.edit', label: 'Modifier les utilisateurs', category: 'Utilisateurs' },
  { id: 'users.delete', label: 'Supprimer les utilisateurs', category: 'Utilisateurs' },
  { id: 'clusters.view', label: 'Voir les clusters', category: 'Clusters' },
  { id: 'clusters.create', label: 'Créer des clusters', category: 'Clusters' },
  { id: 'clusters.edit', label: 'Modifier les clusters', category: 'Clusters' },
  { id: 'clusters.delete', label: 'Supprimer les clusters', category: 'Clusters' },
  { id: 'billing.view', label: 'Voir la facturation', category: 'Facturation' },
  { id: 'billing.manage', label: 'Gérer la facturation', category: 'Facturation' },
  { id: 'settings.view', label: 'Voir les paramètres', category: 'Paramètres' },
  { id: 'settings.edit', label: 'Modifier les paramètres', category: 'Paramètres' },
];

export function UserManagementActions({ user, currentUserId }: UserManagementActionsProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editForm, setEditForm] = useState({
    full_name: user.full_name || '',
    role: user.role,
    permissions: user.permissions,
  });
  const { toast } = useToast();

  const isCurrentUser = user.id === currentUserId;
  const supabase = createClient();

  const handleEditUser = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          full_name: editForm.full_name,
          role: editForm.role,
          permissions: editForm.permissions,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      toast({
        title: 'Utilisateur modifié',
        description: 'Les informations de l\'utilisateur ont été mises à jour.',
      });
      
      setIsEditDialogOpen(false);
      // Recharger la page pour voir les changements
      window.location.reload();
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de modifier l\'utilisateur.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    setIsLoading(true);
    try {
      // Supprimer le profil utilisateur (cascade supprimera l'utilisateur auth)
      const { error } = await supabase
        .from('user_profiles')
        .delete()
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      toast({
        title: 'Utilisateur supprimé',
        description: 'L\'utilisateur a été supprimé avec succès.',
      });
      
      setIsDeleteDialogOpen(false);
      // Recharger la page pour voir les changements
      window.location.reload();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer l\'utilisateur.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePermissionChange = (permissionId: string, checked: boolean) => {
    setEditForm(prev => ({
      ...prev,
      permissions: checked
        ? [...prev.permissions, permissionId]
        : prev.permissions.filter(p => p !== permissionId)
    }));
  };

  const groupedPermissions = AVAILABLE_PERMISSIONS.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = [];
    }
    acc[permission.category].push(permission);
    return acc;
  }, {} as Record<string, typeof AVAILABLE_PERMISSIONS>);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Ouvrir le menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem
            onClick={() => {
              setEditForm({
                full_name: user.full_name || '',
                role: user.role,
                permissions: user.permissions,
              });
              setIsEditDialogOpen(true);
            }}
          >
            <Edit className="mr-2 h-4 w-4" />
            Modifier
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setIsDeleteDialogOpen(true)}
            disabled={isCurrentUser}
            className="text-red-600"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Supprimer
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Dialog de modification */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier l'utilisateur</DialogTitle>
            <DialogDescription>
              Modifiez les informations, le rôle et les permissions de l'utilisateur.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Nom complet</Label>
              <Input
                id="full_name"
                value={editForm.full_name}
                onChange={(e) => setEditForm(prev => ({ ...prev, full_name: e.target.value }))}
                placeholder="Nom complet"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Rôle</Label>
              <Select
                value={editForm.role}
                onValueChange={(value: 'admin' | 'user') => 
                  setEditForm(prev => ({ ...prev, role: value }))
                }
                disabled={isCurrentUser}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">
                    <div className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      Utilisateur
                    </div>
                  </SelectItem>
                  <SelectItem value="admin">
                    <div className="flex items-center">
                      <Shield className="mr-2 h-4 w-4" />
                      Administrateur
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              {isCurrentUser && (
                <p className="text-xs text-muted-foreground">
                  Vous ne pouvez pas modifier votre propre rôle.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Permissions</Label>
              {editForm.role === 'admin' ? (
                <p className="text-sm text-muted-foreground">
                  Les administrateurs ont toutes les permissions automatiquement.
                </p>
              ) : (
                <div className="space-y-4 max-h-60 overflow-y-auto border rounded-md p-3">
                  {Object.entries(groupedPermissions).map(([category, permissions]) => (
                    <div key={category}>
                      <h4 className="font-medium text-sm mb-2">{category}</h4>
                      <div className="space-y-2 ml-4">
                        {permissions.map((permission) => (
                          <div key={permission.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={permission.id}
                              checked={editForm.permissions.includes(permission.id)}
                              onCheckedChange={(checked) => 
                                handlePermissionChange(permission.id, checked as boolean)
                              }
                            />
                            <Label htmlFor={permission.id} className="text-sm">
                              {permission.label}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              disabled={isLoading}
            >
              Annuler
            </Button>
            <Button onClick={handleEditUser} disabled={isLoading}>
              {isLoading ? 'Modification...' : 'Modifier'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de suppression */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer l'utilisateur</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <Trash2 className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Attention
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>
                    La suppression de l'utilisateur <strong>{user.full_name || user.email}</strong> 
                    supprimera définitivement :
                  </p>
                  <ul className="list-disc list-inside mt-2">
                    <li>Son compte et profil</li>
                    <li>Toutes ses données associées</li>
                    <li>Ses clusters et configurations</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isLoading}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteUser}
              disabled={isLoading}
            >
              {isLoading ? 'Suppression...' : 'Supprimer définitivement'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}