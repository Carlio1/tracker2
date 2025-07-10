
"use client";

import { useState, useMemo, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Settings, Eye, EyeOff, Trash2 } from 'lucide-react';
import { GoalModal } from './goal-modal';
import { cn } from '@/lib/utils';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

const TILES_PER_PAGE = 100;
const DENOMINATIONS = [500, 200, 100, 50, 20, 10];

type Tile = {
  id: number;
  value: number;
  completed: boolean;
};

export function TileTrackerClient() {
  const [goal, setGoal] = useState(10000);
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [completedTiles, setCompletedTiles] = useState(() => new Set<number>());
  const [isProgressVisible, setIsProgressVisible] = useState(true);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const generateTiles = useCallback(() => {
    if (goal <= 0) {
      setTiles([]);
      return;
    }
  
    let remaining = goal;
    const newTiles: Omit<Tile, 'id'>[] = [];
  
    // Create a weighted list of denominations to encourage variety
    const weightedDenominations = DENOMINATIONS.flatMap(d => Array(Math.ceil(500 / (d * 2))).fill(d));

    while (remaining > 0) {
        // Find a random denomination that is less than or equal to the remaining amount
        const availableDenominations = weightedDenominations.filter(d => d <= remaining);
        
        let denomination;
        if (availableDenominations.length > 0) {
            const randomIndex = Math.floor(Math.random() * availableDenominations.length);
            denomination = availableDenominations[randomIndex];
        } else {
            // If no standard denomination fits, find the largest standard one that does
            const smallerDenominations = DENOMINATIONS.filter(d => d <= remaining);
            if (smallerDenominations.length > 0) {
                denomination = smallerDenominations[0]; // Largest of the smaller ones
            } else {
                 // If the remaining amount is smaller than the smallest denomination
                if (remaining > 0) {
                    newTiles.push({ value: remaining, completed: false });
                }
                break; // Exit loop
            }
        }
        
        newTiles.push({ value: denomination, completed: false });
        remaining -= denomination;
    }

    // Shuffle the tiles for a random layout
    for (let i = newTiles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newTiles[i], newTiles[j]] = [newTiles[j], newTiles[i]];
    }
  
    const finalTiles = newTiles.map((tile, index) => ({ ...tile, id: index }));
    setTiles(finalTiles);
  
  }, [goal]);

  useEffect(() => {
    generateTiles();
    setCompletedTiles(new Set());
    setCurrentPage(1);
  }, [goal, generateTiles]);

  const sum = useMemo(() => {
    return Array.from(completedTiles).reduce((total, tileId) => {
        const tile = tiles.find(t => t.id === tileId);
        return total + (tile ? tile.value : 0);
    }, 0);
  }, [completedTiles, tiles]);
  
  const progress = useMemo(() => (goal > 0 ? (sum / goal) * 100 : 0), [sum, goal]);

  const handleTileClick = (tileId: number) => {
    setCompletedTiles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(tileId)) {
        newSet.delete(tileId);
      } else {
        newSet.add(tileId);
      }
      return newSet;
    });
  };
  
  const resetSum = () => {
    setCompletedTiles(new Set());
  };

  const formatNumber = (amount: number) => {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount);
  }

  const totalPages = Math.ceil(tiles.length / TILES_PER_PAGE);
  const paginatedTiles = tiles.slice((currentPage - 1) * TILES_PER_PAGE, currentPage * TILES_PER_PAGE);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="container mx-auto p-4 flex flex-col gap-8 w-full max-w-7xl">
      <header className="flex justify-between items-center">
        <h1 className="text-3xl sm:text-4xl font-bold font-headline text-primary-foreground">TileTracker</h1>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setIsProgressVisible(!isProgressVisible)} aria-label="Toggle progress bar visibility">
            {isProgressVisible ? <EyeOff /> : <Eye />}
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setIsGoalModalOpen(true)} aria-label="Open settings">
            <Settings />
          </Button>
        </div>
      </header>

      {isProgressVisible && (
        <Card className="bg-card/80 backdrop-blur-sm border-border shadow-lg shadow-primary/5 transition-all duration-300 animate-in fade-in-0 zoom-in-95">
          <CardContent className="p-6">
            <div className="flex justify-between items-end mb-2">
              <div className='flex flex-col'>
                <span className="text-muted-foreground">Progreso</span>
                <span className="text-3xl font-bold text-primary-foreground">{formatNumber(sum)}</span>
              </div>
              <span className="text-lg font-semibold text-muted-foreground">Meta: {formatNumber(goal)}</span>
            </div>
            <Progress value={progress} className="h-4" />
            <div className="text-right mt-2 text-sm text-accent font-semibold">{Math.min(100, progress).toFixed(2)}%</div>
          </CardContent>
        </Card>
      )}

      <main>
        <div className="grid grid-cols-5 md:grid-cols-10 lg:grid-cols-10 gap-2">
          {paginatedTiles.map((tile) => (
            <Card
              key={tile.id}
              onClick={() => handleTileClick(tile.id)}
              className={cn(
                "group aspect-square flex flex-col justify-center items-center text-center p-2 cursor-pointer transition-all duration-300 ease-in-out bg-card/50 hover:bg-primary/80 hover:scale-105 active:scale-95 hover:shadow-lg hover:shadow-primary/20 border-border",
                completedTiles.has(tile.id) && "bg-primary text-primary-foreground"
              )}
              role="button"
              aria-label={`Añadir ${tile.value} al total`}
              aria-pressed={completedTiles.has(tile.id)}
            >
                <div className={cn(
                  "text-xl font-bold text-accent transition-colors duration-300 group-hover:text-primary-foreground",
                   completedTiles.has(tile.id) && "text-primary-foreground"
                   )}>${tile.value}</div>
            </Card>
          ))}
        </div>
      </main>

      {totalPages > 1 && (
         <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); handlePageChange(currentPage - 1)}} disabled={currentPage === 1}/>
            </PaginationItem>
             <PaginationItem>
                <PaginationLink isActive>
                  Página {currentPage} de {totalPages}
                </PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext href="#" onClick={(e) => { e.preventDefault(); handlePageChange(currentPage + 1)}} disabled={currentPage === totalPages}/>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      <footer className="flex justify-center items-center gap-4 mt-8">
        <Button onClick={resetSum} variant="destructive" className="bg-destructive/80 hover:bg-destructive">
          <Trash2 className="mr-2 h-4 w-4" /> Resetear Progreso
        </Button>
      </footer>
      
      <GoalModal
        isOpen={isGoalModalOpen}
        onOpenChange={setIsGoalModalOpen}
        currentGoal={goal}
        onSetGoal={(newGoal) => {
          setGoal(newGoal);
          setCompletedTiles(new Set());
          setCurrentPage(1);
        }}
      />
    </div>
  );
}
